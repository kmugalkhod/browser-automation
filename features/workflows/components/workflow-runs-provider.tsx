"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { useRealtimeRunsWithTag } from "@trigger.dev/react-hooks"

import type {
  RunStep,
  runWorkflowTask,
} from "@/features/workflows/tasks/run-workflow"

type WorkflowRunsContextValue = {
  runs: ReturnType<
    typeof useRealtimeRunsWithTag<typeof runWorkflowTask>
  >["runs"]
}

const WorkflowRunsContext = createContext<WorkflowRunsContextValue | null>(null)

export function WorkflowRunsProvider({
  workflowId,
  publicAccessToken,
  children,
}: {
  workflowId: string
  publicAccessToken: string
  children: ReactNode
}) {
  const { runs } = useRealtimeRunsWithTag<typeof runWorkflowTask>(
    `workflow:${workflowId}`,
    { accessToken: publicAccessToken }
  )
  const value = useMemo(() => ({ runs }), [runs])

  return (
    <WorkflowRunsContext.Provider value={value}>
      {children}
    </WorkflowRunsContext.Provider>
  )
}

export function useLatestRunSteps() {
  const context = useContext(WorkflowRunsContext)

  if (!context) {
    throw new Error(
      "useLatestRunSteps must be used within a WorkflowRunsProvider"
    )
  }

  const activeRun = context.runs.findLast(
    (run) => run.isQueued || run.isExecuting
  )
  const latestRun = activeRun ?? context.runs.at(-1)
  const liveSteps = latestRun?.metadata?.steps as RunStep[] | undefined

  return {
    steps: latestRun?.output?.steps ?? liveSteps ?? [],
    isLive: Boolean(activeRun),
  }
}
