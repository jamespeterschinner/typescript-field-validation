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

const validateField =
  (objectOrArray: Record<string, any> | any[], failFast: boolean) =>
  (acc: Record<string, any> | null, [rawField, rest]: [string, CondensedFields | null]): Record<string, any> | null => {
    if (failFast && acc) {
      return acc;
    }
    const fieldIsArray = IsArrayNotation(rawField);

    const field = fieldIsArray ? stripArrayNotation(rawField) : rawField;

    const hasAttribute = objectOrArray.hasOwnProperty(field);

    if (!hasAttribute) {
      acc = acc ?? {};
      acc[field] = `is missing`;
      return acc;
    }
    const value = (objectOrArray as Record<string, any>)[field];

    // Perform the basic checks first and fail fast
    if (value === null) {
      acc = acc ?? {};
      acc[field] = `is null`;
      return acc;
    } else if (value === undefined) {
      acc = acc ?? {};
      acc[field] = `is undefined`;
      return acc;
    }

    const valueIsArray = Array.isArray(value);

    if (fieldIsArray && !valueIsArray) {
      acc = acc ?? {};
      acc[field] = `is required to be an array, but is a ${typeof value}`;
      return acc;
    } else if (rest) {
      if (!fieldIsArray && valueIsArray) {
        // We only want to check this for chained fields
        acc = acc ?? {};
        acc[field] = `is required to be an object, but is an array`;
        return acc;
      }

      const restEntries = Object.entries(rest);
      if (valueIsArray) {
        const intermediate = (value as any[])
          .map((item: any) => restEntries.reduce(validateField(item, failFast), null))
          .filter((identity) => identity);
        if (intermediate.length > 0) {
          acc = acc ?? {};
          acc[field] = intermediate;
          return acc;
        }
      } else {
        const intermediate = restEntries.reduce(validateField(value, failFast), null);
        if (intermediate) {
          acc = acc ?? {};
          acc[field] = intermediate;
          return acc;
        }
      }
    }

    return acc;
  };

export function validate<
  T extends Record<string, any> | any[],
  R extends readonly string[],
  Valid extends SetRequired<T, R[number]>,
>(obj: T | Valid, requiredFields: R, failFast = true): Result<Valid> {
  const condensedFields = condense(requiredFields);

  let invalidFields = null;

  invalidFields = Object.entries<CondensedFields | null>(condensedFields).reduce(validateField(obj, failFast), null);

  console.log(invalidFields);
  return {
    invalidFields,
    validType: invalidFields ? null : (obj as Valid),
  } as Result<Valid>;
}
