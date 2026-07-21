import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
  return (
    <main className="flex h-full min-h-0 items-center justify-center bg-background text-foreground">
      <Spinner className="size-6" />
    </main>
  )
}
