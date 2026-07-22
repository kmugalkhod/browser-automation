"use server"

import { auth } from "@clerk/nextjs/server"
import { runs, tasks } from "@trigger.dev/sdk"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { workflows } from "@/db/schema"
import { createworkflow as creativeWorkflow } from "@/feature/workflows/data"
import type { helloWorldTask } from "@/src/trigger/example"

const terminalRunStatuses = new Set([
  "COMPLETED",
  "CANCELED",
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "EXPIRED",
  "TIMED_OUT",
])

function isTerminalRunStatus(status: string) {
  return terminalRunStatuses.has(status)
}

export async function createWorkflowAction(name: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("An active organization is required to create a workflow")
  }

  const workflow = await creativeWorkflow(orgId, name)

  if (!workflow) {
    throw new Error("Failed to create workflow")
  }

  revalidatePath("/(dashboard)", "layout")
  redirect(`/workflows/${workflow.id}`)
}

export const createWorkFlowsAction = createWorkflowAction

async function getWorkflowForRunAction(workflowId: string) {
  const { orgId } = await auth.protect()

  if (!orgId) {
    throw new Error("An active organization is required to run a workflow")
  }

  const [workflow] = await db
    .select({
      id: workflows.id,
      name: workflows.name,
    })
    .from(workflows)
    .where(
      and(eq(workflows.id, workflowId), eq(workflows.organizationId, orgId))
    )
    .limit(1)

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  return workflow
}

export async function runWorkflowAction(workflowId: string) {
  const workflow = await getWorkflowForRunAction(workflowId)

  const handle = await tasks.trigger<typeof helloWorldTask>(
    "hello-world",
    {
      message: `Run workflow ${workflow.name} (${workflow.id})`,
    },
    {
      tags: [`workflow_${workflow.id}`],
    }
  )

  return {
    id: handle.id,
    status: "QUEUED",
    taskIdentifier: "hello-world",
    isTerminal: false,
  }
}

export async function getWorkflowRunStatusAction(
  workflowId: string,
  runId: string
) {
  const workflow = await getWorkflowForRunAction(workflowId)
  const run = await runs.retrieve<typeof helloWorldTask>(runId)

  if (!run.tags.includes(`workflow_${workflow.id}`)) {
    throw new Error("Run does not belong to this workflow")
  }

  return {
    id: run.id,
    status: run.status,
    taskIdentifier: run.taskIdentifier,
    isTerminal: isTerminalRunStatus(run.status),
    isSuccess: run.isSuccess,
    isFailed: run.isFailed,
    isCancelled: run.isCancelled,
    outputMessage: run.output?.message,
    errorMessage: run.error?.message,
    updatedAt: run.updatedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
  }
}
