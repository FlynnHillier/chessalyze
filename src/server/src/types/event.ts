export type EmitType<E extends string,D extends object> = {
    event:E,
    data:D
}

export type ExtractEmitEvent<T> = T extends EmitType<infer E, infer _> ? E : never
export type ExtractEmitData<T> = T extends EmitType<infer _, infer D> ? D : never