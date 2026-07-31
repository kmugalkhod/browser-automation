import { logger, metadata, task } from "@trigger.dev/sdk"
import toposort from "toposort"

import { getWorkflow } from "@/features/workflows/data"
import { interpolate } from "@/features/workflows/lib/interpolate"
import { validateGraph } from "@/features/workflows/lib/validateGraph"
import { Stagehand } from "@browserbasehq/stagehand"
import { nodeExecutors } from "@/features/workflows/nodes/nodes-executors"

export type RunStep = {
  id: string
  status: "pending" | "running" | "done" | "failed"
}

export const runWorkflowTask = task({
  id: "run-workflow",
  run: async ({
    workflowId,
    organizationId,
  }: {
    workflowId: string
    organizationId: string
  }) => {
    const workflow = await getWorkflow(organizationId, workflowId)

    if (!workflow?.graph) {
      throw new Error("Workflow has no graph.")
    }

    const { nodes, edges } = workflow.graph
    const problems = validateGraph(workflow.graph)

    if (problems.length > 0) {
      throw new Error(problems.join(" "))
    }

    const nodesById = new Map(nodes.map((node) => [node.id, node]))
    const connectedNodeIds = new Set(
      edges.flatMap(({ source, target }) => [source, target])
    )
    const order = toposort
      .array(
        nodes.map((node) => node.id),
        edges.map(({ source, target }) => [source, target])
      )
      .filter((id) => connectedNodeIds.has(id))
    let steps: RunStep[] = order.map((id) => ({
      id,
      status: "pending",
    }))

    metadata.set("steps", steps)

    const setStepStatus = (stepId: string, status: RunStep["status"]) => {
      steps = steps.map((step) =>
        step.id === stepId ? { ...step, status } : step
      )
      metadata.set("steps", steps)
    }

    logger.log("Running workflow", {
      workflowName: workflow.name,
      steps: order.length,
    })

    let stagehand: Stagehand | undefined
    const nodeOutputs: Record<string, unknown> = {}
    const getStagehand = async () => {
      if (stagehand) return stagehand
      stagehand = new Stagehand({
        env: "BROWSERBASE",
        apiKey: process.env.BROWSERBASE_API_KEY,
        model: "google/gemini-2.5-flash",
        disablePino: true,
      })
      await stagehand.init()
      return stagehand
    }

    try {
      for (const nodeId of order) {
        const node = nodesById.get(nodeId)

        if (!node) {
          continue
        }

        logger.log("Running step", {
          step: node.data.title,
          stepId: node.id,
        })
        if (!steps.some((step) => step.id === nodeId)) {
          continue
        }

        setStepStatus(nodeId, "running")
        await metadata.flush()

        try {
          const executor =
            nodeExecutors[node.data.type as keyof typeof nodeExecutors]

          if (executor) {
            const values = Object.fromEntries(
              Object.entries(node.data.values).map(([key, value]) => [
                key,
                interpolate(value, nodeOutputs),
              ])
            )
            nodeOutputs[node.id] = await executor({ values, getStagehand })
          }

          setStepStatus(nodeId, "done")
        } catch (error) {
          setStepStatus(nodeId, "failed")
          await metadata.flush()
          throw error
        }
      }

      return { steps }
    } finally {
      await stagehand?.close()
    }
  },
})
