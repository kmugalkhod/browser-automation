"use client"

import {
  OrganizationSwitcher,
  UserButton,
  useOrganization,
  useUser,
} from "@clerk/nextjs"
import { Building2 } from "lucide-react"

const organizationUrls = {
  afterCreateOrganizationUrl: "/",
  afterSelectOrganizationUrl: "/",
} as const

export function ExpandedOrganizationSwitcher() {
  return (
    <OrganizationSwitcher
      hidePersonal
      {...organizationUrls}
      appearance={{
        elements: {
          rootBox: "w-full min-w-0 overflow-hidden",
          organizationSwitcherTrigger:
            "h-11 w-full min-w-0 justify-start gap-3 overflow-hidden rounded-lg border-0 bg-transparent px-1 pr-2 text-sidebar-foreground hover:bg-sidebar-accent",
          organizationPreview: "min-w-0 flex-1 overflow-hidden",
          organizationPreviewAvatarBox: "size-10 shrink-0 rounded-xl",
          organizationPreviewMainIdentifier: "min-w-0 truncate",
          organizationPreviewSecondaryIdentifier: "hidden",
          organizationSwitcherTriggerIcon:
            "ml-1 shrink-0 text-sidebar-foreground/70",
        },
      }}
    />
  )
}

export function CollapsedOrganizationSwitcher() {
  const { organization } = useOrganization()

  return (
    <div className="relative flex size-10 items-center justify-center">
      <OrganizationSwitcher
        hidePersonal
        {...organizationUrls}
        appearance={{
          elements: {
            rootBox: "absolute inset-0 z-10 size-10 opacity-0",
            organizationSwitcherTrigger: "size-10",
          },
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-sidebar-accent bg-cover bg-center text-sidebar-foreground"
        style={
          organization?.imageUrl
            ? { backgroundImage: `url("${organization.imageUrl}")` }
            : undefined
        }
      >
        {!organization?.imageUrl && <Building2 className="size-5" />}
      </span>
    </div>
  )
}

export function ExpandedUserButton() {
  return (
    <UserButton
      showName
      appearance={{
        elements: {
          rootBox: "min-w-0 max-w-full",
          userButtonTrigger:
            "max-w-full justify-start overflow-hidden rounded-lg",
          userButtonBox: "min-w-0 overflow-hidden",
          userButtonOuterIdentifier: "truncate text-sidebar-foreground",
          avatarBox: "size-10 shrink-0",
        },
      }}
    />
  )
}

export function CollapsedUserButton() {
  const { user } = useUser()

  return (
    <div className="relative flex size-10 items-center justify-center">
      <UserButton
        appearance={{
          elements: {
            rootBox: "absolute inset-0 z-10 size-10 opacity-0",
            userButtonTrigger: "size-10",
          },
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-sidebar-accent bg-cover bg-center text-sm font-medium text-sidebar-foreground"
        style={
          user?.imageUrl
            ? { backgroundImage: `url("${user.imageUrl}")` }
            : undefined
        }
      >
        {!user?.imageUrl &&
          (user?.firstName?.charAt(0) ?? user?.username?.charAt(0) ?? "U")}
      </span>
    </div>
  )
}
