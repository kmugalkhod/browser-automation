type NodeOutputs = Record<string, unknown>

function getByPath(value: unknown, path: string) {
  const segments = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)

  return segments.reduce<unknown>((current, segment) => {
    if (
      current === null ||
      current === undefined ||
      (typeof current !== "object" && typeof current !== "function") ||
      !Object.prototype.hasOwnProperty.call(current, segment)
    ) {
      return undefined
    }

    return (current as Record<string, unknown>)[segment]
  }, value)
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined) {
    return ""
  }

  if (typeof value === "object") {
    try {
      return JSON.stringify(value) ?? ""
    } catch {
      return ""
    }
  }

  return String(value)
}

/**
 * Replaces {{ nodeId.path }} placeholders with values from previous node outputs.
 */
export function interpolate(text: string, nodeOutputs: NodeOutputs) {
  return text.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, expression: string) => {
    const match = expression.trim().match(/^([^.[\s]+)(.*)$/)

    if (!match) {
      return ""
    }

    const [, nodeId, path] = match
    const output = nodeOutputs[nodeId]
    const value = path ? getByPath(output, path) : output

    return stringifyValue(value)
  })
}
