export type ReducerAction<Type extends string, Payload extends {}> = {
  type: Type;
  payload: Payload;
};
