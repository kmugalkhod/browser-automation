import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { Spinner } from "@/components/ui/spinner"
import { useLatestRunSteps } from "@/features/workflows/components/workflow-runs-provider"
import { cn } from "@/lib/utils"

function StepNodeComponent({ id, data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title, values } = data
  const def = nodeRegistry[type]
  const Icon = def.icon
  const { steps, isLive } = useLatestRunSteps()
  const step = steps.find((step) => step.id === id)
  const isRunning = isLive && step?.status === "running"
  const isFailed = step?.status === "failed"

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  return (
    <div
      className={cn(
        "group relative w-56 rounded-(--radius) border border-border bg-card text-card-foreground transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-foreground/25 hover:bg-card",
        selected
          ? "border-ring ring-2 ring-ring/35 ring-offset-2 ring-offset-background"
          : "shadow-xs",
        isRunning
          ? "border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20"
          : isFailed
            ? "border-destructive"
            : undefined
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Left}
          style={{ transform: "translate(-100%, -50%)" }}
          className="h-3.5! w-1.5! min-w-0! rounded-l-xs! rounded-r-none! border-0! bg-muted-foreground/70! transition-colors group-hover:bg-foreground!"
        />
      )}

      <div className="flex items-center gap-2.5 px-3 py-3">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            def.accent
          )}
        >
          {isRunning ? (
            <Spinner
              aria-label="Step running"
              className="size-4 motion-reduce:animate-none"
            />
          ) : (
            <Icon className="size-4" />
          )}
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold">{title}</span>
          <span
            className={cn(
              "block text-xs capitalize",
              isRunning
                ? "font-medium text-blue-700 dark:text-blue-300"
                : "text-muted-foreground"
            )}
          >
            {isRunning ? "Running" : kind}
          </span>
        </div>
      </div>

      {def.fields.length > 0 && (
        <div className="border-t border-border px-3 py-1.5">
          {def.fields.map((field) => {
            const value = values[field.key]

            return (
              <div
                key={field.key}
                className="flex min-w-0 items-center gap-2 text-xs"
              >
                <span className="shrink-0 text-muted-foreground">
                  {field.label}
                </span>
                <span
                  title={value}
                  className={cn(
                    "truncate font-medium",
                    value ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {value || "Not set"}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        style={{ transform: "translate(100%, -50%)" }}
        className="h-3.5! w-1.5! min-w-0! rounded-l-none! rounded-r-xs! border-0! bg-muted-foreground/70! transition-colors group-hover:bg-foreground!"
      />
    </div>
  )
}

export const StepNode = memo(StepNodeComponent)
