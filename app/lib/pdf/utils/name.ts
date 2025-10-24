
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import dayjs from "dayjs"

export function generatePDFName() {
  const date = dayjs().format("YYYY-MM-DD")

  const name = uniqueNamesGenerator({
    dictionaries: [colors, adjectives, animals],
    separator: "",
    style: 'capital',
  })

  return `${date}_${name}_merged`
}