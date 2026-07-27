import {
  adjectives,
  animals,
  uniqueNamesGenerator,
} from "unique-names-generator"

export function generateWorkflowName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    length: 2,
    separator: "-",
    style: "lowerCase",
  })
}
