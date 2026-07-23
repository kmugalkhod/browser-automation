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
  MiniMap,
  Panel,
  ReactFlow,
  type DefaultEdgeOptions,
  type Edge,
  type NodeTypes,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from "@xyflow/react"
import { GitBranchIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { StepNode } from "@/features/workflows/components/step-node"
import {
  createStepNode,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"

type WorkflowNode = StepNodeType
type WorkflowEdge = Edge

const nodeTypes = {
  step: StepNode,
} satisfies NodeTypes

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
  createStepNode({
    id: "start",
    type: "start",
    position: { x: 0, y: 0 },
  }),
  createStepNode({
    id: "open-url",
    type: "open-url",
    position: { x: 280, y: 0 },
    values: { url: "https://youtube.com" },
  }),
]

const initialEdges: WorkflowEdge[] = [
  {
    id: "start-open-url",
    source: "start",
    target: "open-url",
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
        nodeTypes={nodeTypes}
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
        <Panel position="top-left" className="pointer-events-none m-4">
          <div
            aria-label={`${nodes.length} workflow steps`}
            className="workflow-canvas-summary"
          >
            <GitBranchIcon aria-hidden="true" className="size-4" />
            <span className="font-medium text-foreground">Workflow</span>
            <span
              aria-hidden="true"
              className="size-1 rounded-full bg-border"
            />
            <span>{nodes.length} steps</span>
          </div>
        </Panel>
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.4}
          color="var(--workflow-canvas-dot-color)"
        />
        <Controls aria-label="Canvas controls" position="bottom-left" />
        <MiniMap
          ariaLabel="Workflow overview"
          className="workflow-canvas-minimap hidden sm:block"
          nodeColor="var(--muted-foreground)"
          nodeStrokeColor="var(--background)"
          nodeBorderRadius={6}
          nodeStrokeWidth={2}
          bgColor="var(--background)"
          maskColor="color-mix(in oklch, var(--background) 72%, transparent)"
          maskStrokeColor="var(--ring)"
          maskStrokeWidth={1}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}
