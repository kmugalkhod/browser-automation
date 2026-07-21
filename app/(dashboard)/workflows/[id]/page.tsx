type WorkflowPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = await params

  return (
    <main className="flex h-full min-h-0 flex-col gap-2 bg-background px-6 py-10 text-foreground">
      <p className="text-sm font-medium text-muted-foreground">Workflow ID</p>
      <h1 className="break-all font-heading text-2xl font-semibold tracking-tight">
        {id}
      </h1>
    </main>
  )
}
