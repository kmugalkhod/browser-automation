"use client"

import { useState } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  ReactFlowProvider,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { RightSidebar } from "@/features/workflows/components/right-sidebar"
import {
  initialEdges,
  initialNodes,
  WorkflowCanvas,
} from "@/features/workflows/components/workflow-canvas"
import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

type WorkflowShellProps = {
  workflowId: string
}

export function WorkflowShell({ workflowId }: WorkflowShellProps) {
  const [sidebarTab, setSidebarTab] = useState("toolbar")
  const flow = useLiveblocksFlow<StepNodeType, Edge>({
    suspense: true,
    nodes: { initial: initialNodes },
    edges: { initial: initialEdges },
  })
  const openNodeEditor: NodeMouseHandler<StepNodeType> = () =>
    setSidebarTab("editor")

  return (
    <ReactFlowProvider>
      <main className="size-full min-h-0 bg-background text-foreground">
        <ResizablePanelGroup
          id={`workflow-${workflowId}-shell`}
          orientation="horizontal"
          className="size-full"
        >
          <ResizablePanel id="primary" minSize="30rem">
            <ResizablePanelGroup
              id={`workflow-${workflowId}-primary`}
              orientation="vertical"
              className="size-full"
            >
              <ResizablePanel id="canvas" minSize="18rem">
                <WorkflowCanvas {...flow} onNodeClick={openNodeEditor} />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel id="logs" defaultSize="8rem" minSize="6rem">
                <div className="flex size-full items-center justify-center bg-background text-sm font-medium text-muted-foreground">
                  Logs
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel
            id="inspector"
            defaultSize="16rem"
            minSize="14rem"
            maxSize="36rem"
          >
            <RightSidebar
              workflowId={workflowId}
              onNodesChange={flow.onNodesChange}
              tab={sidebarTab}
              onTabChange={setSidebarTab}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </ReactFlowProvider>
  )
}
