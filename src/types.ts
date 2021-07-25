type Field<T extends string> = T extends `${infer Field}.${string}` ? Field : T;

type Rest<T extends string> = T extends `${string}.${infer Rest}`
  ? Rest
  : never;

export type SetRequired<T, NN extends string> = Pick<T, Exclude<keyof T, Field<NN>>> &
  {
    [K in Field<NN>]-?: K extends keyof T
      ? Rest<NN> extends string
        ? NonNullable<T[K]> extends (infer U)[]
          ? SetRequired<NonNullable<U>, Rest<NN>>[]
          : SetRequired<NonNullable<T[K]>, Rest<NN>>
        : NonNullable<T[K]> extends (infer U)[]
        ? NonNullable<U>[]
        : NonNullable<T[K]>
      : never;
  };
