"use client"

import { useState } from "react"
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

const workflows = [
  { name: "Daily lead capture", detail: "Ready" },
  { name: "Invoice upload", detail: "Queued" },
  { name: "Competitor prices", detail: "2 min ago" },
  { name: "Support inbox sweep", detail: "Paused" },
  { name: "Weekly report export", detail: "Tomorrow" },
  { name: "CRM enrichment", detail: "Ready" },
  { name: "Partner portal sync", detail: "1 hr ago" },
  { name: "QA checkout flow", detail: "Draft" },
  { name: "Renewal reminders", detail: "Friday" },
] as const

type WorkflowItem = (typeof workflows)[number]

function WorkflowList({
  selectedWorkflow,
  onSelectWorkflow,
}: {
  selectedWorkflow: WorkflowItem["name"]
  onSelectWorkflow: (workflow: WorkflowItem["name"]) => void
}) {
  return (
    <SidebarMenu className="gap-0.5" role="radiogroup" aria-label="Workflows">
      {workflows.map((workflow) => (
        <SidebarMenuItem key={workflow.name}>
          <SidebarMenuButton
            type="button"
            role="radio"
            aria-checked={selectedWorkflow === workflow.name}
            onClick={() => onSelectWorkflow(workflow.name)}
            isActive={selectedWorkflow === workflow.name}
            tooltip={workflow.name}
            className="h-11 rounded-lg px-2.5 text-sidebar-foreground"
          >
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full border border-sidebar-border bg-transparent group-data-active/menu-button:border-sidebar-primary group-data-active/menu-button:bg-sidebar-primary"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm leading-5">
                {workflow.name}
              </span>
              <span className="block truncate text-xs leading-4 text-sidebar-foreground/60 group-data-active/menu-button:text-sidebar-accent-foreground/70">
                {workflow.detail}
              </span>
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function CollapsedWorkflowMenu({
  selectedWorkflow,
  onSelectWorkflow,
}: {
  selectedWorkflow: WorkflowItem["name"]
  onSelectWorkflow: (workflow: WorkflowItem["name"]) => void
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
        <Button type="button" size="lg" className="justify-start">
          <Plus />
          New workflow
        </Button>
        <Separator className="bg-sidebar-border" />
        <div
          className="flex flex-col gap-1"
          role="radiogroup"
          aria-label="Workflows"
        >
          {workflows.map((workflow) => (
            <button
              type="button"
              key={workflow.name}
              role="radio"
              aria-checked={selectedWorkflow === workflow.name}
              data-active={selectedWorkflow === workflow.name}
              onClick={() => onSelectWorkflow(workflow.name)}
              className="flex h-10 items-center justify-between gap-3 rounded-lg px-2.5 text-left text-sm outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full border border-sidebar-border bg-transparent data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"
                  data-active={selectedWorkflow === workflow.name}
                />
                <span className="truncate">{workflow.name}</span>
              </span>
              <span className="shrink-0 text-xs text-sidebar-foreground/60">
                {workflow.detail}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function WorkflowNav() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<
    WorkflowItem["name"]
  >(workflows[0].name)

  return (
    <>
      <SidebarContent className="hidden items-center overflow-visible px-1 pt-8 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:overflow-visible">
        <CollapsedWorkflowMenu
          selectedWorkflow={selectedWorkflow}
          onSelectWorkflow={setSelectedWorkflow}
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
          >
            <Plus />
          </Button>
        </div>
        <div className="pt-2">
          <WorkflowList
            selectedWorkflow={selectedWorkflow}
            onSelectWorkflow={setSelectedWorkflow}
          />
        </div>
      </SidebarContent>
    </>
  )
}
