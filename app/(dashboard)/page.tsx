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
    <main className="flex h-full min-h-0 items-center justify-center bg-background text-foreground">
      <Empty className="max-w-none gap-0 border-0 p-6">
        <EmptyHeader className="max-w-none gap-0">
          <EmptyMedia
            variant="icon"
            className="mb-7 size-12 rounded-xl bg-muted text-foreground [&_svg:not([class*='size-'])]:size-6"
          >
            <Workflow strokeWidth={2.2} />
          </EmptyMedia>
          <EmptyTitle className="text-xl leading-tight font-medium tracking-[-0.025em]">
            No workflow selected
          </EmptyTitle>
          <EmptyDescription className="mt-5 max-w-md text-xl leading-[1.65] text-muted-foreground">
            Select a workflow from the sidebar
            <br />
            or create a new one to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-7 max-w-none">
          <Button className="h-12 rounded-xl px-5 text-xl font-medium">
            <Plus className="size-6" strokeWidth={1.8} />
            New workflow
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
