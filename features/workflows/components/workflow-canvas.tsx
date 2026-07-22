"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  ConnectionLineType,
  Controls,
  MarkerType,
  ReactFlow,
  type DefaultEdgeOptions,
  type Edge,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react"
import { useTheme } from "next-themes"

type WorkflowNode = Node<{ label: string }>
type WorkflowEdge = Edge

const nodeClassName =
  "rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-sm"

const edgeType = "smoothstep" satisfies NonNullable<WorkflowEdge["type"]>

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: edgeType,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "var(--muted-foreground)",
  },
  style: {
    stroke: "var(--muted-foreground)",
    strokeWidth: 1.5,
  },
}

const initialNodes: WorkflowNode[] = [
  {
    id: "start",
    type: "input",
    position: { x: 0, y: 0 },
    className: nodeClassName,
    data: { label: "Start workflow" },
  },
  {
    id: "browser",
    position: { x: 240, y: 120 },
    className: nodeClassName,
    data: { label: "Run browser task" },
  },
  {
    id: "finish",
    type: "output",
    position: { x: 520, y: 20 },
    className: nodeClassName,
    data: { label: "Finish" },
  },
]

const initialEdges: WorkflowEdge[] = [
  {
    id: "start-browser",
    source: "start",
    target: "browser",
    type: edgeType,
  },
  {
    id: "browser-finish",
    source: "browser",
    target: "finish",
    type: edgeType,
  },
]

const subscribeToHydration = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

function useIsHydrated() {
  return useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  )
}

export function WorkflowCanvas() {
  const { resolvedTheme } = useTheme()
  const isHydrated = useIsHydrated()
  const [nodes, setNodes] = useState(initialNodes)
  const [edges, setEdges] = useState(initialEdges)
  const colorMode = isHydrated && resolvedTheme === "dark" ? "dark" : "light"

  const onNodesChange = useCallback<OnNodesChange<WorkflowNode>>(
    (changes) =>
      setNodes((nodesSnapshot) =>
        applyNodeChanges<WorkflowNode>(changes, nodesSnapshot)
      ),
    []
  )
  const onEdgesChange = useCallback<OnEdgesChange<WorkflowEdge>>(
    (changes) =>
      setEdges((edgesSnapshot) =>
        applyEdgeChanges<WorkflowEdge>(changes, edgesSnapshot)
      ),
    []
  )
  const onConnect = useCallback<OnConnect>(
    (connection) =>
      setEdges((edgesSnapshot) =>
        addEdge({ ...connection, type: edgeType }, edgesSnapshot)
      ),
    []
  )

  return (
    <div className="size-full min-h-0 bg-background">
      <ReactFlow
        aria-label="Workflow canvas"
        className="workflow-canvas-flow text-foreground [&_.react-flow__attribution]:text-muted-foreground [&_.react-flow__controls]:overflow-hidden [&_.react-flow__controls]:rounded-md [&_.react-flow__controls]:border [&_.react-flow__controls]:border-border"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={defaultEdgeOptions.style}
        fitView
        fitViewOptions={{ padding: 0.35 }}
        snapToGrid
        snapGrid={[16, 16]}
        colorMode={colorMode}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.4}
          color="var(--workflow-canvas-dot-color)"
        />
        <Controls />
      </ReactFlow>
    </div>
  )
}
