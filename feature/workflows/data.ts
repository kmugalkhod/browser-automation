import { auth } from "@clerk/nextjs/server"
import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { workflows } from "@/db/schema"

function createWorkflowSlug(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return `${slug || "workflow"}-${crypto.randomUUID().slice(0, 8)}`
}

export function listworkflows(orgId: string) {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.organizationId, orgId))
    .orderBy(desc(workflows.createdAt))
}

export async function createworkflow(orgId: string, name: string) {
  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error("Workflow name is required")
  }

  const { userId } = await auth.protect()
  const [workflow] = await db
    .insert(workflows)
    .values({
      organizationId: orgId,
      ownerId: userId,
      slug: createWorkflowSlug(trimmedName),
      name: trimmedName,
    })
    .returning()

  return workflow
}
