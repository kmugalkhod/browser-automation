"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, Workflow } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { Workflow as WorkflowRecord } from "@/db/schema"
import { generateSlug } from "@/feature/workflows/lib/generate-slug"

type CreateWorkflowAction = (name: string) => Promise<void>

function getWorkflowDetail(workflow: WorkflowRecord) {
  return workflow.description?.trim() || "Ready"
}

function getWorkflowHref(workflow: WorkflowRecord) {
  return `/workflows/${workflow.id}`
}

function isActiveWorkflowPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function WorkflowList({
  workflows,
  variant = "expanded",
}: {
  workflows: WorkflowRecord[]
  variant?: "expanded" | "collapsed"
}) {
  const pathname = usePathname()

  if (workflows.length === 0) {
    return (
      <div className="rounded-lg px-2.5 py-3 text-sm text-sidebar-foreground/60">
        No workflows
      </div>
    )
  }

  return (
    <SidebarMenu className="gap-0.5" aria-label="Workflows">
      {workflows.map((workflow) => {
        const href = getWorkflowHref(workflow)
        const isActive = isActiveWorkflowPath(pathname, href)

        return (
          <SidebarMenuItem key={workflow.id}>
            <SidebarMenuButton
              render={<Link href={href} />}
              isActive={isActive}
              tooltip={workflow.name}
              className={
                variant === "collapsed"
                  ? "h-10 justify-between rounded-lg px-2.5 text-sidebar-foreground"
                  : "h-11 rounded-lg px-2.5 text-sidebar-foreground"
              }
            >
              {variant === "collapsed" ? (
                <>
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full border border-sidebar-border bg-transparent group-data-active/menu-button:border-sidebar-primary group-data-active/menu-button:bg-sidebar-primary"
                    />
                    <span className="truncate">{workflow.name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-sidebar-foreground/60 group-data-active/menu-button:text-sidebar-accent-foreground/70">
                    {getWorkflowDetail(workflow)}
                  </span>
                </>
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full border border-sidebar-border bg-transparent group-data-active/menu-button:border-sidebar-primary group-data-active/menu-button:bg-sidebar-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm leading-5">
                      {workflow.name}
                    </span>
                    <span className="block truncate text-xs leading-4 text-sidebar-foreground/60 group-data-active/menu-button:text-sidebar-accent-foreground/70">
                      {getWorkflowDetail(workflow)}
                    </span>
                  </span>
                </>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

function CollapsedWorkflowMenu({
  workflows,
  onCreateWorkflow,
  isCreatingWorkflow,
}: {
  workflows: WorkflowRecord[]
  onCreateWorkflow: () => void
  isCreatingWorkflow: boolean
}) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Open workflows"
        className="flex size-10 items-center justify-center rounded-xl text-sidebar-foreground outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent"
      >
        <Workflow className="size-5 shrink-0" strokeWidth={2.2} />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="max-h-[calc(100svh-2rem)] w-80 gap-3 overflow-y-auto rounded-xl bg-sidebar p-3 text-sidebar-foreground ring-sidebar-border"
      >
        <PopoverHeader className="gap-1 px-1">
          <PopoverTitle>Workflows</PopoverTitle>
          <PopoverDescription>{workflows.length} saved</PopoverDescription>
        </PopoverHeader>
        <Button
          type="button"
          size="lg"
          className="justify-start"
          disabled={isCreatingWorkflow}
          onClick={onCreateWorkflow}
        >
          <Plus />
          New workflow
        </Button>
        <Separator className="bg-sidebar-border" />
        <div className="flex flex-col gap-1">
          <WorkflowList workflows={workflows} variant="collapsed" />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function WorkflowNav({
  workflows,
  createWorkflowAction,
}: {
  workflows: WorkflowRecord[]
  createWorkflowAction: CreateWorkflowAction
}) {
  const [isCreatingWorkflow, startCreateWorkflowTransition] = useTransition()

  function handleCreateWorkflow() {
    startCreateWorkflowTransition(async () => {
      await createWorkflowAction(generateSlug())
    })
  }

  return (
    <>
      <SidebarContent className="hidden items-center overflow-visible px-1 pt-8 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:overflow-visible">
        <CollapsedWorkflowMenu
          workflows={workflows}
          isCreatingWorkflow={isCreatingWorkflow}
          onCreateWorkflow={handleCreateWorkflow}
        />
      </SidebarContent>

      <SidebarContent className="px-4 py-4 group-data-[collapsible=icon]:hidden">
        <div className="flex h-8 items-center justify-between px-2 text-sm font-medium text-sidebar-foreground">
          <div className="flex min-w-0 items-center gap-2">
            <Workflow className="size-4 shrink-0 text-sidebar-foreground/70" />
            <span>Workflows</span>
            <span className="rounded-md bg-sidebar-accent px-1.5 py-0.5 text-xs font-normal text-sidebar-foreground/70">
              {workflows.length}
            </span>
          </div>
          <Button
            type="button"
            aria-label="New workflow"
            variant="ghost"
            size="icon-sm"
            disabled={isCreatingWorkflow}
            onClick={handleCreateWorkflow}
          >
            <Plus />
          </Button>
        </div>
        <div className="pt-2">
          <WorkflowList workflows={workflows} />
        </div>
      </SidebarContent>
    </>
  )
}
