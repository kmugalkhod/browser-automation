"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createworkflow as creativeWorkflow } from "@/feature/workflows/data"

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
