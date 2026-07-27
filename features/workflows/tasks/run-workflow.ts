import { logger, task } from "@trigger.dev/sdk"
import toposort from "toposort"

import { getWorkflow } from "@/features/workflows/data"
import { validateGraph } from "@/features/workflows/lib/validateGraph"

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

    logger.log("Running workflow", {
      workflowName: workflow.name,
      steps: order.length,
    })

    for (const nodeId of order) {
      const node = nodesById.get(nodeId)

      if (!node) {
        continue
      }

      logger.log("Running step", {
        step: node.data.title,
        stepId: node.id,
      })
      // TODO: Execute the node according to its registry type.
    }

    return { steps: order.length }
  },
})
