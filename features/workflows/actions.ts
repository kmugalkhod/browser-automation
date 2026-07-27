"use server"

import { auth } from "@clerk/nextjs/server"
import { runs, tasks } from "@trigger.dev/sdk"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { db } from "@/db"
import { type WorkflowGraph, workflows } from "@/db/schema"
import {
  createworkflow as creativeWorkflow,
  saveWorkflowGraph,
} from "@/features/workflows/data"
import { liveblocks } from "@/lib/liveblocks"
import type { runWorkflowTask } from "@/features/workflows/tasks/run-workflow"

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

export async function deleteWorkflowAction(workflowId: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("An active organization is required to delete a workflow")
  }

  const [workflow] = await db
    .select({ id: workflows.id })
    .from(workflows)
    .where(
      and(eq(workflows.id, workflowId), eq(workflows.organizationId, orgId))
    )
    .limit(1)

  if (!workflow) {
    throw new Error("Workflow not found")
  }

  await liveblocks.deleteRoom(`workflow:${orgId}:v2:${workflow.id}`)

  await db
    .delete(workflows)
    .where(
      and(eq(workflows.id, workflowId), eq(workflows.organizationId, orgId))
    )

  revalidatePath("/(dashboard)", "layout")
}

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

export async function runWorkflowAction({
  id,
  graph,
}: {
  id: string
  graph: WorkflowGraph
}) {
  const { orgId } = await auth.protect()

  if (!orgId) {
    throw new Error("An active organization is required to run a workflow")
  }

  await saveWorkflowGraph({ organizationId: orgId, id, graph })
  const workflow = await getWorkflowForRunAction(id)

  const handle = await tasks.trigger<typeof runWorkflowTask>(
    "run-workflow",
    {
      workflowId: workflow.id,
      organizationId: orgId,
    },
    {
      tags: [`workflow:${workflow.id}`],
    }
  )

  return {
    id: handle.id,
    publicAccessToken: handle.publicAccessToken,
    status: "QUEUED",
    taskIdentifier: "run-workflow",
    isTerminal: false,
  }
}

export async function getWorkflowRunStatusAction(
  workflowId: string,
  runId: string
) {
  const workflow = await getWorkflowForRunAction(workflowId)
  const run = await runs.retrieve<typeof runWorkflowTask>(runId)

  if (!run.tags.includes(`workflow:${workflow.id}`)) {
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
    outputSteps: run.output?.steps,
    errorMessage: run.error?.message,
    updatedAt: run.updatedAt.toISOString(),
    finishedAt: run.finishedAt?.toISOString() ?? null,
  }
}

export async function cancelWorkflowAction(runId: string) {
  const { orgId } = await auth.protect()

  if (!orgId) {
    throw new Error("An active organization is required to cancel a workflow")
  }

  await runs.cancel(runId)
}
