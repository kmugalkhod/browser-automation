import { generateWorkflowName } from "@/features/workflows/lib/generate"

export function generateSlug() {
  return `${generateWorkflowName()}-${crypto.randomUUID().slice(0, 8)}`
}
