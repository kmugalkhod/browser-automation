"use client"

import { useMemo } from "react"
import { useEdges, useNodes } from "@xyflow/react"

import {
  nodeRegistry,
  type NodeType,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

export type UpstreamConnection = {
  token: string
  label: string
  type: NodeType
}

/**
 * Returns every output exposed by nodes that lead into `selectedNode`.
 *
 * The React Flow subscriptions keep this list in sync as nodes or edges change.
 */
export function useUpstreamConnections(selectedNode?: StepNodeType) {
  const nodes = useNodes<StepNodeType>()
  const edges = useEdges()

  return useMemo<UpstreamConnection[]>(() => {
    if (!selectedNode) {
      return []
    }

    const nodesById = new Map(nodes.map((node) => [node.id, node]))
    const visitedNodeIds = new Set([selectedNode.id])
    const pendingNodeIds = [selectedNode.id]
    const connections: UpstreamConnection[] = []

    while (pendingNodeIds.length > 0) {
      const targetNodeId = pendingNodeIds.shift()

      if (!targetNodeId) {
        continue
      }

      for (const edge of edges) {
        if (edge.target !== targetNodeId || visitedNodeIds.has(edge.source)) {
          continue
        }

        const sourceNode = nodesById.get(edge.source)

        if (!sourceNode) {
          continue
        }

        visitedNodeIds.add(sourceNode.id)
        pendingNodeIds.push(sourceNode.id)

        for (const output of nodeRegistry[sourceNode.data.type].outputs) {
          connections.push({
            token: `{{ ${sourceNode.id}.${output.path} }}`,
            label: `${sourceNode.data.title} · ${output.label}`,
            type: sourceNode.data.type,
          })
        }
      }
    }

    return connections
  }, [edges, nodes, selectedNode])
}
