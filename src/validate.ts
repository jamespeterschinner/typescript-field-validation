import { SetRequired, Result } from 'src';

type CondensedFields = { [key: string]: CondensedFields | null };

function merge(acc: CondensedFields, fields: string[]): CondensedFields {
  const field = fields.shift();
  if (field) {
    acc[field] = fields.length ? merge(acc[field] ?? {}, fields) : acc[field] ?? null;
  }

  return acc;
}

function condense(fields: readonly string[]): CondensedFields {
  return fields.map((field) => field.split('.')).reduce(merge, {});
}

function stripArrayNotation(field: string): string {
  return field.slice(0, field.length - 2);
}

function IsArrayNotation(field: string): boolean {
  if (field[field.length - 1] === ']') {
    return true;
  }
  return false;
}

function flattenResult(result: Record<string, any>, includeIndex = true, top = true): string[] {
  if (typeof result === 'string') {
    return [`:${result}`];
  }
  const isArray = Array.isArray(result);
  const concatFunc: (key: string) => (str: string) => string = top
    ? (key) => (str) => `${key}${str}`
    : isArray
    ? includeIndex
      ? (key) => (str) => `[${key}]${str}`
      : () => (str) => `[]${str}`
    : (key) => (str) => `.${key}${str}`;

  return Object.entries(result).flatMap(([key, value]) =>
    flattenResult(value, includeIndex, false).map(concatFunc(key)),
  );
}

function formatResult(result: Record<string, any>, includeIndex = true): Record<string, string> {
  const flattenedResult = flattenResult(result, includeIndex, true);
  return Object.fromEntries(flattenedResult.map((fr) => fr.split(':')));
}

function validateBFS(
  que: (() => void)[],
  objectOrArray: Record<string, any>,
  condensedFields: CondensedFields,
  failFast: boolean,
): Record<string, any> | null {
  let result: Record<string, any> | null = null;

  for (const [rawField, rest] of Object.entries(condensedFields)) {
    if (failFast && result) {
      return result;
    }
    const fieldIsArray = IsArrayNotation(rawField);

    const field = fieldIsArray ? stripArrayNotation(rawField) : rawField;

    const hasAttribute = objectOrArray.hasOwnProperty(field);

    if (!hasAttribute) {
      result = result ?? {};
      result[field] = `is missing`;
      continue;
    }
    const value = (objectOrArray as Record<string, any>)[field];

    // Perform the basic checks first and fail fast
    if (value === null) {
      result = result ?? {};
      result[field] = `is null`;
      continue;
    } else if (value === undefined) {
      result = result ?? {};
      result[field] = `is undefined`;
      continue;
    }

    const valueIsArray = Array.isArray(value);

    if (fieldIsArray && !valueIsArray) {
      result = result ?? {};
      result[field] = `is required to be an array, but is a ${typeof value}`;
      continue;
    }

    if (rest) {
      // Delay the recursive call for later
      que.push(() => {
        if (!fieldIsArray && valueIsArray) {
          // We only want to check this for chained fields
          result = result ?? {};
          result[field] = `is required to be an object, but is an array`;
          return true;
        }
        if (valueIsArray) {
          const intermediate = (value as any[]).reduce((acc, item: any) => {
            const maybeResult = validateBFS(que, item, rest, failFast);
            if (maybeResult) {
              acc.push(maybeResult);
            }
            return acc;
          }, []);
          if (intermediate.length > 0) {
            result = result ?? {};
            result[field] = intermediate;
          }
        } else {
          const intermediate = validateBFS(que, value, rest, failFast);
          if (intermediate) {
            result = result ?? {};
            result[field] = intermediate;
          }
        }
      });
    }
  }

  let nextBranch = que.shift();
  while (nextBranch && (failFast ? !result : true)) {
    nextBranch();
    nextBranch = que.shift();
  }

  return result;
}

export function validate<
  T extends Record<string, any> | any[],
  R extends readonly string[],
  Valid extends SetRequired<T, R[number]>,
>(
  obj: T | Valid,
  requiredFields: R,
  options?: { failFast?: true; rawFields?: true; includeIndex?: false },
): Result<Valid> {
  const condensedFields = condense(requiredFields);

  let invalidFields = validateBFS([], obj, condensedFields, options?.failFast ?? false);
  invalidFields = invalidFields && !options?.rawFields ? formatResult(invalidFields, options?.includeIndex) : null;
  return {
    invalidFields,
    validType: invalidFields ? null : (obj as Valid),
  } as Result<Valid>;
}
