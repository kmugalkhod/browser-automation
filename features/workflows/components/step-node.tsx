import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"

import {
  nodeRegistry,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { cn } from "@/lib/utils"

function StepNodeComponent({ data, selected }: NodeProps<StepNodeType>) {
  const { type, kind, title } = data
  const def = nodeRegistry[type]
  const Icon = def.icon

  // A trigger starts the flow and takes no input, so it has no target handle.
  const hasTarget = kind !== "trigger"

  return (
    <div
      className={cn(
        "group relative w-56 rounded-(--radius) border border-border bg-card text-card-foreground transition-[border-color,box-shadow,background-color] duration-200 ease-out hover:border-foreground/25 hover:bg-card",
        selected
          ? "border-ring ring-2 ring-ring/35 ring-offset-2 ring-offset-background"
          : "shadow-xs"
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
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold">{title}</span>
          <span className="block text-xs text-muted-foreground capitalize">
            {kind}
          </span>
        </div>
      </div>

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
