"use client"

import { useEffect, useState, useTransition } from "react"
import { PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  getWorkflowRunStatusAction,
  runWorkflowAction,
} from "@/feature/workflows/actions"

type RightSidebarProps = {
  workflowId: string
}

type WorkflowRunStatus = {
  id: string
  status: string
  taskIdentifier: string
  isTerminal: boolean
  isSuccess?: boolean
  isFailed?: boolean
  isCancelled?: boolean
  outputMessage?: string
  errorMessage?: string
  updatedAt?: string
  finishedAt?: string | null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to run workflow"
}

function getRunLabel(run: WorkflowRunStatus | null, isStarting: boolean) {
  if (isStarting) {
    return "Starting"
  }

  if (!run) {
    return "Run"
  }

  if (run.isTerminal) {
    return "Run again"
  }

  return "Running"
}

export function RightSidebar({ workflowId }: RightSidebarProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [run, setRun] = useState<WorkflowRunStatus | null>(null)
  const [isStartingWorkflow, startRunWorkflowTransition] = useTransition()
  const hasActiveRun = Boolean(run && !run.isTerminal)
  const runId = run?.id ?? null
  const isRunTerminal = run?.isTerminal ?? true

  useEffect(() => {
    if (!runId || isRunTerminal) {
      return
    }

    const activeRunId = runId
    let isCanceled = false
    let isCheckingStatus = false

    async function refreshRunStatus() {
      if (isCheckingStatus) {
        return
      }

      isCheckingStatus = true

      try {
        const nextRun = await getWorkflowRunStatusAction(
          workflowId,
          activeRunId
        )

        if (!isCanceled) {
          setRun(nextRun)
        }
      } catch (error) {
        if (!isCanceled) {
          setErrorMessage(getErrorMessage(error))
        }
      } finally {
        isCheckingStatus = false
      }
    }

    void refreshRunStatus()
    const interval = window.setInterval(refreshRunStatus, 1500)

    return () => {
      isCanceled = true
      window.clearInterval(interval)
    }
  }, [isRunTerminal, runId, workflowId])

  function handleRunWorkflow() {
    setErrorMessage(null)

    startRunWorkflowTransition(async () => {
      try {
        const nextRun = await runWorkflowAction(workflowId)
        setRun(nextRun)
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
      }
    })
  }

  return (
    <aside className="flex size-full flex-col items-center justify-center gap-3 bg-background px-4">
      <Button
        type="button"
        aria-busy={isStartingWorkflow || hasActiveRun}
        disabled={isStartingWorkflow || hasActiveRun}
        onClick={handleRunWorkflow}
      >
        {isStartingWorkflow || hasActiveRun ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <PlayIcon data-icon="inline-start" />
        )}
        {getRunLabel(run, isStartingWorkflow)}
      </Button>
      {run ? (
        <div className="flex max-w-full flex-col items-center gap-1 text-center text-sm">
          <p className="font-medium text-foreground">{run.status}</p>
          <p className="max-w-full truncate font-mono text-xs text-muted-foreground">
            {run.id}
          </p>
          {run.outputMessage ? (
            <p className="max-w-full text-muted-foreground">
              {run.outputMessage}
            </p>
          ) : null}
          {run.errorMessage ? (
            <p className="max-w-full text-destructive">{run.errorMessage}</p>
          ) : null}
        </div>
      ) : null}
      {errorMessage ? (
        <p className="max-w-full text-center text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </aside>
  )
}
