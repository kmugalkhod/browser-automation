"use client"

import { ReactNode } from "react"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"

export function Room({
  roomid,
  children,
}: {
  roomid: string
  children: ReactNode
}) {
  return (
    <LiveblocksProvider throttle={16} authEndpoint="/api/liveblock/auth">
      <RoomProvider id={roomid}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
