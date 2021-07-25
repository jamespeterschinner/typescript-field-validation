type Field<T extends string> = T extends `${infer U}.${string}` ? U : T;

type StripArray<T extends string> = T extends `${infer U}[]` ? U : T;

type IsArray<T extends string> = T extends `${string}[]` ? true : false;

type Rest<T extends string> = T extends `${string}.${infer U}`
  ? U
  : false;

export type SetRequired<T, NN extends string> = Pick<
  T,
  Exclude<keyof T, Field<NN>>
> &
  {
    [K in Field<NN> as StripArray<K>]-?: StripArray<K> extends keyof T
      ? Rest<NN> extends string
        ? IsArray<K> extends true
          ? NonNullable<T[StripArray<K>]> extends (infer U)[]
            ? SetRequired<NonNullable<U>, Rest<NN>>[]
            : never // Type of field must be an array if the required field declares it.
          : SetRequired<NonNullable<T[StripArray<K>]>, Rest<NN>>
        : IsArray<K> extends true
        ? NonNullable<T[StripArray<K>]> extends (infer U)[]
          ? NonNullable<U>[]
          : never // Type of field must be an array if the required field declares it.
        : NonNullable<T[StripArray<K>]>
      : never; // Field must be in type T
  };
