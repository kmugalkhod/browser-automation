import type { WorkflowGraph } from "@/db/schema"
import toposort from "toposort"

/** Returns structural problems that prevent a workflow from being run. */
export function validateGraph({ nodes, edges }: WorkflowGraph): string[] {
  const problems: string[] = []
  const triggerNodes = nodes.filter((node) => node.data.kind === "trigger")

  if (triggerNodes.length !== 1) {
    problems.push(
      `A workflow needs exactly one start trigger. Found ${triggerNodes.length}.`
    )
  }

  if (edges.length === 0) {
    problems.push("Connect your nodes before running.")
  } else {
    try {
      toposort(edges.map(({ source, target }) => [source, target]))
    } catch {
      problems.push("Workflow has a cycle. Remove the loop before running.")
    }
  }

  return problems
}
