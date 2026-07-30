"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useReactFlow, useStore, type OnNodesChange } from "@xyflow/react"
import { Ellipsis, Play, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteWorkflowAction,
  runWorkflowAction,
} from "@/features/workflows/actions"
import { validateGraph } from "@/features/workflows/lib/validateGraph"
import { useLatestRunSteps } from "@/features/workflows/components/workflow-runs-provider"
import {
  nodeRegistry,
  createStepNode,
  type NodeDefinition,
  type NodeField,
  type NodeType,
  type StepNodeKind,
  type StepNodeType,
} from "@/features/workflows/nodes/node-registry"
import { useUpstreamConnections } from "@/features/workflows/hooks/useUpstreamConnections"

const sections: { kind: StepNodeKind; label: string }[] = [
  { kind: "trigger", label: "Triggers" },
  { kind: "action", label: "Actions" },
]

const definitions = Object.values(nodeRegistry)

const nodeWidth = 224
const nodeHeaderHeight = 56
const nodeFieldHeight = 29
const nodeGap = 48
const placementOffsets = Array.from({ length: 17 * 17 }, (_, index) => {
  const row = Math.floor(index / 17) - 8
  const column = (index % 17) - 8

  return { column, row }
}).sort(
  (first, second) =>
    Math.abs(first.column) +
      Math.abs(first.row) -
      (Math.abs(second.column) + Math.abs(second.row)) ||
    Math.abs(first.row) - Math.abs(second.row) ||
    second.column - first.column
)

function NodeIcon({ type, className }: { type: NodeType; className?: string }) {
  const Icon = nodeRegistry[type].icon

  return <Icon aria-hidden="true" className={className ?? "size-4"} />
}

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-2 border-y border-border bg-card px-3 py-1.5 text-sm font-semibold">
        {icon}
        {title}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </section>
  )
}

function Field({
  field,
  value,
  onChange,
  onFocus,
}: {
  field: NodeField
  value: string
  onChange: (value: string) => void
  onFocus: () => void
}) {
  const inputProps = {
    id: field.key,
    value,
    placeholder: field.placeholder,
    required: field.required,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => onChange(event.target.value),
    onFocus,
  }

  if (field.multiline) {
    return <Textarea {...inputProps} rows={5} className="min-h-28 resize-y" />
  }

  return <Input {...inputProps} />
}

function Inspector({ node }: { node: StepNodeType | undefined }) {
  const { updateNodeData } = useReactFlow<StepNodeType>()
  const upstreamConnections = useUpstreamConnections(node)
  const [lastEditedField, setLastEditedField] = useState<{
    nodeId: string
    key: string
  } | null>(null)

  if (!node) {
    return (
      <Section title="Editor">
        <p className="p-3 text-sm text-muted-foreground">
          Select a node to edit it.
        </p>
      </Section>
    )
  }

  const { type, title, values } = node.data
  const definition: NodeDefinition = nodeRegistry[type]
  const activeFieldKey =
    lastEditedField?.nodeId === node.id &&
    definition.fields.some((field) => field.key === lastEditedField.key)
      ? lastEditedField.key
      : definition.fields[0]?.key

  const insertConnectionToken = (token: string) => {
    if (!activeFieldKey) {
      return
    }

    updateNodeData(node.id, {
      values: {
        ...values,
        [activeFieldKey]: `${values[activeFieldKey] ?? ""}${token}`,
      },
    })
    setLastEditedField({ nodeId: node.id, key: activeFieldKey })
  }

  return (
    <Section title={title} icon={<NodeIcon type={type} />}>
      <div className="flex flex-col gap-3 p-3">
        {definition.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            This node has no properties.
          </p>
        ) : (
          definition.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-xs">
                {field.label}
                {field.required && (
                  <>
                    <span aria-hidden="true" className="text-destructive">
                      {" *"}
                    </span>
                    <span className="sr-only"> (required)</span>
                  </>
                )}
              </Label>
              <Field
                field={field}
                value={values[field.key] ?? ""}
                onChange={(value) => {
                  updateNodeData(node.id, {
                    values: { ...values, [field.key]: value },
                  })
                  setLastEditedField({ nodeId: node.id, key: field.key })
                }}
                onFocus={() =>
                  setLastEditedField({ nodeId: node.id, key: field.key })
                }
              />
            </div>
          ))
        )}
        {upstreamConnections.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <h3 className="text-xs font-medium">Connections</h3>
            <div className="flex flex-wrap gap-1.5">
              {upstreamConnections.map((connection) => (
                <Button
                  key={connection.token}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => insertConnectionToken(connection.token)}
                  className="h-7 gap-1.5 px-2 text-xs"
                >
                  <NodeIcon type={connection.type} className="size-3.5" />
                  {connection.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

function Palette({
  onNodesChange,
}: {
  onNodesChange: OnNodesChange<StepNodeType>
}) {
  const { getIntersectingNodes, getNodes, getViewport } =
    useReactFlow<StepNodeType>()
  const width = useStore((state) => state.width)
  const height = useStore((state) => state.height)

  const addNode = (type: NodeType) => {
    const definition = nodeRegistry[type]
    const nodeHeight =
      nodeHeaderHeight + definition.fields.length * nodeFieldHeight
    const nodes = getNodes()

    if (
      definition.kind === "trigger" &&
      nodes.some((node) => node.data.kind === "trigger")
    ) {
      toast.error("A workflow can only have one trigger.")
      return
    }

    const count = nodes.filter((node) => node.data.type === type).length
    const { x, y, zoom } = getViewport()
    const center = {
      x: (width / 2 - x) / zoom,
      y: (height / 2 - y) / zoom,
    }
    const position =
      placementOffsets
        .map(({ column, row }) => ({
          x: center.x - nodeWidth / 2 + column * (nodeWidth + nodeGap),
          y: center.y - nodeHeight / 2 + row * (nodeHeight + nodeGap),
        }))
        .find(
          (candidate) =>
            getIntersectingNodes({
              ...candidate,
              width: nodeWidth,
              height: nodeHeight,
            }).length === 0
        ) ?? center

    onNodesChange([
      {
        type: "add",
        item: createStepNode({
          id: crypto.randomUUID(),
          type,
          position,
          title: `${definition.label} ${count + 1}`,
        }),
      },
    ])
  }

  return (
    <Section title="Toolbar">
      <Accordion
        multiple
        defaultValue={sections.map((section) => section.kind)}
        className="px-3 py-2"
      >
        {sections.map((section) => (
          <AccordionItem key={section.kind} value={section.kind}>
            <AccordionTrigger className="py-2 text-xs font-medium text-muted-foreground hover:no-underline">
              {section.label}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-0.5">
              {definitions
                .filter((definition) => definition.kind === section.kind)
                .map((definition) => {
                  const type = definition.type as NodeType

                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      onClick={() => addNode(type)}
                      className="justify-start gap-2.5 px-1.5 text-xs"
                    >
                      <NodeIcon type={type} />
                      {definition.label}
                    </Button>
                  )
                })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  )
}

function RunButton({ workflowId }: { workflowId: string }) {
  const { getEdges, getNodes } = useReactFlow<StepNodeType>()
  const { isLive } = useLatestRunSteps()
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={isPending || isLive}
      onClick={() => {
        const graph = {
          nodes: getNodes(),
          edges: getEdges(),
        }
        const problems = validateGraph(graph)

        if (problems.length > 0) {
          toast.error(problems[0])
          return
        }

        startTransition(async () => {
          try {
            await runWorkflowAction({ id: workflowId, graph })
            toast.success("Workflow started.")
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Couldn't start the workflow."
            )
          }
        })
      }}
    >
      <Play fill="currentColor" />
      {isPending ? "Starting" : isLive ? "Running" : "Run"}
    </Button>
  )
}

function WorkflowActionsMenu({ workflowId }: { workflowId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Workflow actions"
        disabled={isPending}
        className="inline-flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          variant="destructive"
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              try {
                await deleteWorkflowAction(workflowId)
                toast.success("Workflow deleted.")
                router.replace("/")
              } catch {
                toast.error("Couldn't delete the workflow.")
              }
            })
          }}
        >
          {isPending ? <Spinner /> : <Trash2 />}
          {isPending ? "Deleting workflow..." : "Delete workflow"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function RightSidebar({
  workflowId,
  onNodesChange,
  tab,
  onTabChange,
}: {
  workflowId: string
  onNodesChange: OnNodesChange<StepNodeType>
  tab: string
  onTabChange: (tab: string) => void
}) {
  const selected = useStore((state) =>
    state.nodes.find((node) => node.selected)
  ) as StepNodeType | undefined

  return (
    <Tabs
      value={tab}
      onValueChange={onTabChange}
      className="size-full min-h-0 gap-0 bg-background"
    >
      <div className="flex items-center justify-end gap-1 border-b border-border p-2">
        <RunButton workflowId={workflowId} />
        <WorkflowActionsMenu workflowId={workflowId} />
      </div>
      <TabsList className="m-2 w-fit bg-background">
        <TabsTrigger
          value="toolbar"
          className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
        >
          Toolbar
        </TabsTrigger>
        <TabsTrigger
          value="editor"
          className="flex-none rounded-sm data-active:bg-accent! data-active:text-accent-foreground! data-active:shadow-none! dark:data-active:border-transparent!"
        >
          Editor
        </TabsTrigger>
      </TabsList>
      <TabsContent value="toolbar" className="flex min-h-0 flex-1 flex-col">
        <Palette onNodesChange={onNodesChange} />
      </TabsContent>
      <TabsContent value="editor" className="flex min-h-0 flex-1 flex-col">
        <Inspector node={selected} />
      </TabsContent>
    </Tabs>
  )
}
