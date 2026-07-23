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
    <LiveblocksProvider
      throttle={16}
      publicApiKey={
        process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!
      }
    >
      <RoomProvider id={roomid}>
        <ClientSideSuspense fallback={<div>Loading…</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
