import { auth } from "@clerk/nextjs/server"
import type { CreateRoomOptions } from "@liveblocks/node"
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
  const { orgId, userId } = await auth()

  if (!orgId || !userId || !(await getWorkflow(orgId, id))) {
    notFound()
  }

  const roomId = `workflow:${orgId}:v2:${id}`
  const roomAccess = {
    defaultAccesses: [],
    groupsAccesses: {
      [orgId]: ["room:write"],
    },
    usersAccesses: {
      [userId]: ["room:write"],
    },
  } satisfies Omit<CreateRoomOptions, "organizationId">

  await liveblocks.getOrCreateRoom(roomId, {
    ...roomAccess,
    organizationId: orgId,
  })

  return (
    <Room roomid={roomId}>
      <WorkflowShell workflowId={id} />
    </Room>
  )
}
