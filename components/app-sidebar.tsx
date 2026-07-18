"use client"

import {
  OrganizationSwitcher,
  UserButton,
  useOrganization,
  useUser,
} from "@clerk/nextjs"
import { Building2, Plus, Workflow } from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
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

const organizationUrls = {
  afterCreateOrganizationUrl: "/",
  afterSelectOrganizationUrl: "/",
} as const

function ExpandedOrganizationSwitcher() {
  return (
    <OrganizationSwitcher
      hidePersonal
      {...organizationUrls}
      appearance={{
        elements: {
          rootBox: "min-w-0 flex-1 overflow-hidden",
          organizationSwitcherTrigger:
            "h-11 w-full min-w-0 justify-start overflow-hidden rounded-lg border-0 bg-transparent px-1 text-sidebar-foreground hover:bg-sidebar-accent",
          organizationPreview: "min-w-0 overflow-hidden",
          organizationPreviewMainIdentifier: "truncate",
          organizationPreviewSecondaryIdentifier: "hidden",
        },
      }}
    />
  )
}

function CollapsedOrganizationSwitcher() {
  const { organization } = useOrganization()

  return (
    <div className="relative size-10">
      <OrganizationSwitcher
        hidePersonal
        {...organizationUrls}
        appearance={{
          elements: {
            rootBox: "absolute inset-0 size-10 opacity-0",
            organizationSwitcherTrigger: "size-10",
          },
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-sidebar-accent bg-cover bg-center text-sidebar-foreground"
        style={
          organization?.imageUrl
            ? { backgroundImage: `url("${organization.imageUrl}")` }
            : undefined
        }
      >
        {!organization?.imageUrl && <Building2 className="size-5" />}
      </span>
    </div>
  )
}

function CollapsedUserButton() {
  const { user } = useUser()

  return (
    <div className="relative size-10">
      <UserButton
        appearance={{
          elements: {
            rootBox: "absolute inset-0 size-10 opacity-0",
            userButtonTrigger: "size-10",
          },
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-sidebar-accent bg-cover bg-center text-sm font-medium text-sidebar-foreground"
        style={
          user?.imageUrl
            ? { backgroundImage: `url("${user.imageUrl}")` }
            : undefined
        }
      >
        {!user?.imageUrl &&
          (user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? "U")}
      </span>
    </div>
  )
}

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
        className="flex size-10 items-center justify-center rounded-xl text-[#f5f5f5] outline-none hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring data-popup-open:bg-sidebar-accent"
      >
        <Workflow className="size-5 shrink-0" strokeWidth={2.2} />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        className="dark max-h-[calc(100svh-2rem)] w-80 gap-3 overflow-y-auto rounded-2xl bg-sidebar p-4 text-sidebar-foreground ring-sidebar-border"
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
          {workflows.map((workflow, index) => (
            <button
              type="button"
              key={workflow}
              className={
                index === 0
                  ? "h-11 rounded-xl bg-sidebar-accent px-3 text-left text-base"
                  : "h-11 rounded-xl px-3 text-left text-base hover:bg-sidebar-accent"
              }
            >
              {workflow}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function AppSidebar() {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar className="dark" variant="inset" collapsible="icon">
      {isCollapsed ? (
        <>
          <SidebarHeader className="items-center gap-3 p-2 pt-4">
            <CollapsedOrganizationSwitcher />
            <SidebarTrigger className="size-10 rounded-xl text-[#f5f5f5]" />
          </SidebarHeader>

          <SidebarContent className="items-center overflow-visible px-1 pt-8">
            <CollapsedWorkflowMenu />
          </SidebarContent>

          <SidebarFooter className="items-center p-2 pb-4">
            <CollapsedUserButton />
          </SidebarFooter>
        </>
      ) : (
        <>
          <SidebarHeader className="px-5 pt-5 pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="min-w-0 flex-1 overflow-hidden">
                <ExpandedOrganizationSwitcher />
              </div>
              <SidebarTrigger className="size-9 shrink-0 rounded-lg" />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-5 pt-8">
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

          <SidebarFooter className="p-5">
            <UserButton
              showName
              appearance={{
                elements: {
                  rootBox: "min-w-0 max-w-full",
                  userButtonTrigger:
                    "max-w-full justify-start overflow-hidden rounded-lg",
                  userButtonBox: "min-w-0 overflow-hidden",
                  userButtonOuterIdentifier: "truncate text-sidebar-foreground",
                  avatarBox: "size-10 shrink-0",
                },
              }}
            />
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  )
}
