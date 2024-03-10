export type EmitEventType<E extends string, D extends object> = {
  event: E,
  data: D
}

export type ExtractEmitEvent<T> = T extends EmitEventType<infer E, infer _> ? E : never
export type ExtractEmitData<T> = T extends EmitEventType<infer _, infer D> ? D : never