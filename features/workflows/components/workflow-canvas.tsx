"use client"

import { useSyncExternalStore } from "react"
import {
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
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import { GitBranchIcon } from "lucide-react"
import { useTheme } from "next-themes"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-ui/styles.css"
import "@liveblocks/react-flow/styles.css"
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
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<WorkflowNode, WorkflowEdge>({
      suspense: true,
      nodes: { initial: initialNodes },
      edges: { initial: initialEdges },
    })
  const colorMode = isHydrated && resolvedTheme === "dark" ? "dark" : "light"

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
        onDelete={onDelete}
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
        <Cursors />
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
