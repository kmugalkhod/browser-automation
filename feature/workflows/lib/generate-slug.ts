import { generateWorkflowName } from "@/feature/workflows/lib/generate"

export function generateSlug() {
  return `${generateWorkflowName()}-${crypto.randomUUID().slice(0, 8)}`
}
