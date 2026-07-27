import type { Edge, Node } from "@xyflow/react"
import toposort from "toposort"

type WorkflowNodeData = {
  kind: "trigger" | "action"
}

export type WorkflowValidationIssueCode =
  | "EMPTY_WORKFLOW"
  | "DUPLICATE_NODE_ID"
  | "DUPLICATE_EDGE_ID"
  | "UNKNOWN_EDGE_NODE"
  | "DUPLICATE_EDGE"
  | "INVALID_TRIGGER_COUNT"
  | "TRIGGER_HAS_INPUT"
  | "ACTION_HAS_MULTIPLE_INPUTS"
  | "DISCONNECTED_NODE"
  | "CYCLIC_DEPENDENCY"

export type WorkflowValidationIssue = {
  code: WorkflowValidationIssueCode
  message: string
  nodeId?: string
  edgeId?: string
}

export type WorkflowValidationResult =
  | {
      valid: true
      orderedNodeIds: string[]
      issues: []
    }
  | {
      valid: false
      orderedNodeIds: []
      issues: WorkflowValidationIssue[]
    }

type WorkflowNode = Node<WorkflowNodeData>

/**
 * Validates the execution structure of a workflow and returns nodes in a safe
 * execution order when valid. A runnable workflow has exactly one trigger and
 * every step must be reachable from it through an acyclic graph.
 */
export function validateWorkflowStructure(
  nodes: readonly WorkflowNode[],
  edges: readonly Edge[]
): WorkflowValidationResult {
  const issues: WorkflowValidationIssue[] = []

  if (nodes.length === 0) {
    return invalid([
      {
        code: "EMPTY_WORKFLOW",
        message: "Add a trigger and at least one action before running the workflow.",
      },
    ])
  }

  const nodesById = new Map<string, WorkflowNode>()

  for (const node of nodes) {
    if (nodesById.has(node.id)) {
      issues.push({
        code: "DUPLICATE_NODE_ID",
        message: `The node ID "${node.id}" is used more than once.`,
        nodeId: node.id,
      })
      continue
    }

    nodesById.set(node.id, node)
  }

  const edgesById = new Set<string>()
  const edgePairs = new Set<string>()
  const incomingEdgeCount = new Map<string, number>()
  const outgoingNodeIds = new Map<string, string[]>()
  const graphEdges: [string, string][] = []

  for (const edge of edges) {
    if (edgesById.has(edge.id)) {
      issues.push({
        code: "DUPLICATE_EDGE_ID",
        message: `The edge ID "${edge.id}" is used more than once.`,
        edgeId: edge.id,
      })
      continue
    }

    edgesById.add(edge.id)

    if (!nodesById.has(edge.source) || !nodesById.has(edge.target)) {
      issues.push({
        code: "UNKNOWN_EDGE_NODE",
        message: "Every connection must reference two existing workflow nodes.",
        edgeId: edge.id,
      })
      continue
    }

    const edgePair = `${edge.source}\u0000${edge.target}`
    if (edgePairs.has(edgePair)) {
      issues.push({
        code: "DUPLICATE_EDGE",
        message: "The same two workflow nodes cannot be connected more than once.",
        edgeId: edge.id,
      })
      continue
    }

    edgePairs.add(edgePair)
    graphEdges.push([edge.source, edge.target])
    incomingEdgeCount.set(
      edge.target,
      (incomingEdgeCount.get(edge.target) ?? 0) + 1
    )
    outgoingNodeIds.set(edge.source, [
      ...(outgoingNodeIds.get(edge.source) ?? []),
      edge.target,
    ])
  }

  const triggers = nodes.filter((node) => node.data.kind === "trigger")

  if (triggers.length !== 1) {
    issues.push({
      code: "INVALID_TRIGGER_COUNT",
      message:
        triggers.length === 0
          ? "Add exactly one trigger to start the workflow."
          : "A workflow can have only one trigger.",
    })
  }

  for (const trigger of triggers) {
    if ((incomingEdgeCount.get(trigger.id) ?? 0) > 0) {
      issues.push({
        code: "TRIGGER_HAS_INPUT",
        message: "A trigger cannot have an incoming connection.",
        nodeId: trigger.id,
      })
    }
  }

  for (const node of nodes) {
    if (
      node.data.kind === "action" &&
      (incomingEdgeCount.get(node.id) ?? 0) > 1
    ) {
      issues.push({
        code: "ACTION_HAS_MULTIPLE_INPUTS",
        message: "An action can have only one incoming connection.",
        nodeId: node.id,
      })
    }
  }

  let orderedNodeIds: string[]

  try {
    // `.array` is essential: `toposort(edges)` would omit isolated nodes.
    orderedNodeIds = toposort.array([...nodesById.keys()], graphEdges)
  } catch {
    orderedNodeIds = []
    issues.push({
      code: "CYCLIC_DEPENDENCY",
      message: "Workflow connections cannot contain a cycle.",
    })
  }

  if (triggers.length === 1) {
    const triggerId = triggers[0].id
    const reachableNodeIds = new Set<string>([triggerId])
    const pendingNodeIds = [triggerId]

    while (pendingNodeIds.length > 0) {
      const currentNodeId = pendingNodeIds.pop()

      if (!currentNodeId) {
        continue
      }

      for (const nextNodeId of outgoingNodeIds.get(currentNodeId) ?? []) {
        if (!reachableNodeIds.has(nextNodeId)) {
          reachableNodeIds.add(nextNodeId)
          pendingNodeIds.push(nextNodeId)
        }
      }
    }

    for (const node of nodes) {
      if (!reachableNodeIds.has(node.id)) {
        issues.push({
          code: "DISCONNECTED_NODE",
          message: "Every step must be connected to the workflow trigger.",
          nodeId: node.id,
        })
      }
    }
  }

  return issues.length > 0
    ? invalid(issues)
    : { valid: true, orderedNodeIds, issues: [] }
}

function invalid(issues: WorkflowValidationIssue[]): WorkflowValidationResult {
  return { valid: false, orderedNodeIds: [], issues }
}
