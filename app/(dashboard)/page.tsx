import { Plus, Workflow } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="flex h-full min-h-0 items-center justify-center bg-background px-6 py-10 text-foreground">
      <Empty className="max-w-lg gap-0 border-0 p-0">
        <EmptyHeader className="max-w-md gap-0">
          <EmptyMedia
            variant="icon"
            className="mb-5 size-11 rounded-lg bg-muted text-foreground ring-1 ring-border [&_svg:not([class*='size-'])]:size-5"
          >
            <Workflow strokeWidth={2.2} />
          </EmptyMedia>
          <EmptyTitle className="text-lg leading-7 font-medium tracking-tight">
            Choose a workflow
          </EmptyTitle>
          <EmptyDescription className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            Open a saved automation from the sidebar or start a new browser
            workflow.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-5 max-w-none">
          <Button size="lg">
            <Plus />
            New workflow
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
