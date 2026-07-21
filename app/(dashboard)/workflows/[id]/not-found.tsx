import { SearchX } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export default function NotFound() {
  return (
    <main className="flex h-full min-h-0 items-center justify-center bg-background px-6 py-10 text-foreground">
      <Empty className="max-w-lg gap-0 border-0 p-0">
        <EmptyHeader className="max-w-md gap-0">
          <EmptyMedia
            variant="icon"
            className="mb-5 size-11 rounded-lg bg-muted text-foreground ring-1 ring-border [&_svg:not([class*='size-'])]:size-5"
          >
            <SearchX strokeWidth={2.2} />
          </EmptyMedia>
          <EmptyTitle className="text-lg leading-7 font-medium tracking-tight">
            Workflow not found
          </EmptyTitle>
          <EmptyDescription className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            The workflow you are looking for does not exist or is unavailable.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </main>
  )
}
