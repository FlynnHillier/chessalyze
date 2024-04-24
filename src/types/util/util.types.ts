export type AtleastOneKey<T> = {
  [K in keyof T]-?: Pick<T, K> & Partial<T>;
}[keyof T];

export type ExactlyOneKey<T extends Record<string, any>> = {
  [K in keyof T]-?: { [P in K]: T[K] } & { [Q in Exclude<keyof T, K>]?: never };
}[keyof T];
