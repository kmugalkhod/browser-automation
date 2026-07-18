import {
  CollapsedOrganizationSwitcher,
  CollapsedUserButton,
  ExpandedOrganizationSwitcher,
  ExpandedUserButton,
} from "@/components/app-sidebar-account-controls"
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { WorkflowNav } from "@/feature/workflows/component/workflow-nav"

export function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="hidden items-center gap-3 border-b border-sidebar-border/70 p-2 pt-4 pb-3 group-data-[collapsible=icon]:flex">
        <CollapsedOrganizationSwitcher />
        <SidebarTrigger className="size-10 rounded-xl text-sidebar-foreground" />
      </SidebarHeader>

      <SidebarHeader className="border-b border-sidebar-border/70 px-4 pt-4 pb-3 group-data-[collapsible=icon]:hidden">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0 overflow-hidden">
            <ExpandedOrganizationSwitcher />
          </div>
          <SidebarTrigger className="size-9 shrink-0 rounded-lg" />
        </div>
      </SidebarHeader>

      <WorkflowNav />

      <SidebarFooter className="hidden items-center border-t border-sidebar-border/70 p-2 pt-3 pb-4 group-data-[collapsible=icon]:flex">
        <CollapsedUserButton />
      </SidebarFooter>

      <SidebarFooter className="border-t border-sidebar-border/70 p-4 group-data-[collapsible=icon]:hidden">
        <ExpandedUserButton />
      </SidebarFooter>
    </Sidebar>
  )
}
