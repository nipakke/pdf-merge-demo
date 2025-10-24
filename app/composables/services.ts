type Services = ReturnType<typeof useNuxtApp>["$services"]

export function useService<TKey extends keyof Services>(key: TKey): Services[TKey] {
  return useNuxtApp().$services[key]
}