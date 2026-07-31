import type { Stagehand } from "@browserbasehq/stagehand"

export async function observe({
  stagehand,
  instruction,
}: {
  stagehand: Stagehand
  instruction: string
}) {
  const matches = await stagehand.observe(instruction)

  return {
    matches: matches.map(({ selector, description }) => ({
      selector,
      description,
    })),
  }
}
