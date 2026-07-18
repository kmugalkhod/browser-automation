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
    <main className="flex h-full min-h-0 items-center justify-center bg-[#191919] text-[#f5f5f5]">
      <Empty className="max-w-none gap-0 border-0 p-6">
        <EmptyHeader className="max-w-none gap-0">
          <EmptyMedia
            variant="icon"
            className="mb-7 size-12 rounded-xl bg-[#242424] text-[#f5f5f5] [&_svg:not([class*='size-'])]:size-6"
          >
            <Workflow strokeWidth={2.2} />
          </EmptyMedia>
          <EmptyTitle className="text-xl leading-tight font-medium tracking-[-0.025em]">
            No workflow selected
          </EmptyTitle>
          <EmptyDescription className="mt-5 max-w-md text-xl leading-[1.65] text-[#a6a6a6]">
            Select a workflow from the sidebar
            <br />
            or create a new one to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="mt-7 max-w-none">
          <Button className="h-12 rounded-xl bg-[#f1f1f1] px-5 text-xl font-medium text-[#191919] hover:bg-white">
            <Plus className="size-6" strokeWidth={1.8} />
            New workflow
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  )
}
