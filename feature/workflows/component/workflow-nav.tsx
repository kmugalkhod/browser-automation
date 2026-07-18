"use client"

import { Plus, Workflow } from "lucide-react"

import {
  Popover,
  PopoverContent,
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
  "dominant-wasp",
  "honest-reindeer",
  "expected-llama",
  "essential-ocelot",
  "creepy-echidna",
  "eastern-silkworm",
  "cultural-lion",
  "proud-weasel",
  "regional-bonobo",
]

function WorkflowList() {
  return (
    <SidebarMenu className="gap-1">
      {workflows.map((workflow, index) => (
        <SidebarMenuItem key={workflow}>
          <SidebarMenuButton
            isActive={index === 0}
            className="h-12 rounded-xl px-3 text-base font-normal text-sidebar-foreground"
          >
            <span>{workflow}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

function CollapsedWorkflowMenu() {
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
        className="max-h-[calc(100svh-2rem)] w-80 gap-3 overflow-y-auto rounded-2xl bg-sidebar p-4 text-sidebar-foreground ring-sidebar-border"
      >
        <button
          type="button"
          className="flex h-11 items-center gap-3 rounded-xl px-3 text-left text-lg hover:bg-sidebar-accent"
        >
          <Plus className="size-5" />
          New workflow
        </button>
        <Separator className="bg-sidebar-border" />
        <div className="flex flex-col gap-1">
          {workflows.map((workflow) => (
            <button
              type="button"
              key={workflow}
              className="h-11 rounded-xl px-3 text-left text-base hover:bg-sidebar-accent"
            >
              {workflow}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function WorkflowNav() {
  return (
    <>
      <SidebarContent className="hidden items-center overflow-visible px-1 pt-8 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:overflow-visible">
        <CollapsedWorkflowMenu />
      </SidebarContent>

      <SidebarContent className="px-5 pt-8 group-data-[collapsible=icon]:hidden">
        <div className="flex h-10 items-center justify-between px-2 text-lg font-medium text-sidebar-foreground">
          <span>Workflows</span>
          <button
            type="button"
            aria-label="New workflow"
            className="flex size-9 items-center justify-center rounded-lg hover:bg-sidebar-accent"
          >
            <Plus className="size-5" />
          </button>
        </div>
        <div className="pt-4">
          <WorkflowList />
        </div>
      </SidebarContent>
    </>
  )
}
