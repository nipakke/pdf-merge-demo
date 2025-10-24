export function createObjectURL(input?: Blob | File) {
  return input && URL.createObjectURL(input)
}

export function revokeObjectURL(input?: string) {
  return input && URL.revokeObjectURL(input)
}