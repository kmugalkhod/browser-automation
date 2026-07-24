import { auth } from "@clerk/nextjs/server"
import { notFound } from "next/navigation"

import { getWorkflow } from "@/feature/workflows/data"
import { Room } from "@/features/workflows/components/room"
import { WorkflowShell } from "@/features/workflows/components/workflow-shell"
import { liveblocks } from "@/lib/liveblocks"

type WorkflowPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = await params
  const { orgId } = await auth()

  if (!orgId || !(await getWorkflow(orgId, id))) {
    notFound()
  }

  await liveblocks.getOrCreateRoom(id, {
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    organizationId: orgId,
  })

  return (
    <Room roomid={id}>
      <WorkflowShell workflowId={id} />
    </Room>
  )
}
