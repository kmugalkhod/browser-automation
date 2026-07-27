import { sql } from "drizzle-orm"
import type { Edge } from "@xyflow/react"
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"

export type WorkflowGraph = {
  nodes: StepNodeType[]
  edges: Edge[]
}

export const workflows = pgTable(
  "workflows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: text("organization_id").notNull(),
    ownerId: text("owner_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    definition: jsonb("definition")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    graph: jsonb("graph").$type<WorkflowGraph>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("workflows_organization_slug_unique").on(
      table.organizationId,
      table.slug
    ),
    index("workflows_owner_id_idx").on(table.ownerId),
  ]
)

export type Workflow = typeof workflows.$inferSelect
export type NewWorkflow = typeof workflows.$inferInsert
