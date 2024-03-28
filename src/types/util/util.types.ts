export type OneOf<T> = {
  [K in keyof T]-?: Pick<T, K> & Partial<T>;
}[keyof T];
