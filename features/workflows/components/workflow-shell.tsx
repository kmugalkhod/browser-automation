import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

type WorkflowShellProps = {
  workflowId: string
}

export function WorkflowShell({ workflowId }: WorkflowShellProps) {
  return (
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
              <div className="flex size-full items-center justify-center bg-background text-sm font-medium text-muted-foreground">
                Canvas
              </div>
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
          <div className="flex size-full items-center justify-center bg-background text-sm font-medium text-muted-foreground">
            Inspector
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
