import type { WorkflowGraph } from "@/db/schema"
import toposort from "toposort"

/** Returns structural problems that prevent a workflow from being run. */
export function validateGraph({ nodes, edges }: WorkflowGraph): string[] {
  const problems: string[] = []
  const triggerNodes = nodes.filter((node) => node.data.kind === "trigger")
  const nodeIds = new Set(nodes.map((node) => node.id))

  if (triggerNodes.length !== 1) {
    problems.push(
      `A workflow needs exactly one start trigger. Found ${triggerNodes.length}.`
    )
  }

  if (edges.length === 0) {
    problems.push("Connect your nodes before running.")
  } else {
    const outgoingNodeIds = new Map<string, string[]>()

    for (const edge of edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        problems.push("Every connection must link two workflow nodes.")
        continue
      }

      outgoingNodeIds.set(edge.source, [
        ...(outgoingNodeIds.get(edge.source) ?? []),
        edge.target,
      ])
    }

    try {
      toposort(edges.map(({ source, target }) => [source, target]))
    } catch {
      problems.push("Workflow has a cycle. Remove the loop before running.")
    }

    if (triggerNodes.length === 1) {
      const reachableNodeIds = new Set([triggerNodes[0].id])
      const pendingNodeIds = [triggerNodes[0].id]

      while (pendingNodeIds.length > 0) {
        const nodeId = pendingNodeIds.pop()

        if (!nodeId) {
          continue
        }

        for (const nextNodeId of outgoingNodeIds.get(nodeId) ?? []) {
          if (!reachableNodeIds.has(nextNodeId)) {
            reachableNodeIds.add(nextNodeId)
            pendingNodeIds.push(nextNodeId)
          }
        }
      }

      if (nodes.some((node) => !reachableNodeIds.has(node.id))) {
        problems.push(
          "Every node must be connected to the start trigger before running."
        )
      }
    }
  }

  return problems
}
