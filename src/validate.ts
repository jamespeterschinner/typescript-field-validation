import { SetRequired, Result } from 'src';

function fieldRest(fields: string): [string, string | null] {
  const splitAt = fields.indexOf('.');
  if (splitAt === -1) {
    return [fields, null];
  }
  return [fields.slice(0, splitAt), fields.slice(splitAt + 1)];
}

function stripArrayNotation(field: `${string}[]`): string {
  return field.slice(0, field.length - 2);
}

function IsArrayNotation(field: string): field is `${string}[]` {
  if (field[field.length - 1] === ']') {
    return true;
  }
  return false;
}

function IsNotFalse<T>(value: T | false): value is T {
  return value !== false;
}

function validateField(objectOrArray: Record<string, any> | any[], firstRest: string, index?: number): string | false {
  const [field, fieldIsArray, rest] = (([rawField, passThroughRest]): [string, boolean, string | null] => {
    if (IsArrayNotation(rawField)) {
      return [stripArrayNotation(rawField), true, passThroughRest];
    }
    return [rawField, false, passThroughRest];
  })(fieldRest(firstRest));

  const hasAttribute = objectOrArray.hasOwnProperty(field);

  const maybeIndex = index !== undefined ? `[${index}].` : '';

  if (!hasAttribute) {
    return `${maybeIndex}${field} is missing`;
  }
  const value = (objectOrArray as Record<string, any>)[field];

  if (value === null) {
    return `${maybeIndex}${field} is null`;
  } else if (value === undefined) {
    return `${maybeIndex}${field} is undefined`;
  } else if (fieldIsArray && !Array.isArray(value)) {
    return `${maybeIndex}${field} is not an array`;
  } else if (rest) {
    if (fieldIsArray) {
      const missingFields = (value as any[]).map((item, idx) => validateField(item, rest, idx)).filter(IsNotFalse);
      if (missingFields.length > 0) {
        return `${field}${missingFields.join(` and ${field}`)}`;
      }
    } else {
      const missingField = validateField(value, rest);
      if (missingField) {
        return `${field}.${missingField}`;
      }
    }
  }
  return false; // will be filtered out
}

export function validate<
  T extends Record<string, any> | any[],
  R extends readonly string[],
  Valid extends SetRequired<T, R[number]>,
>(obj: T | Valid, required: R): Result<Valid> {
  const result = required.map((field) => validateField(obj, field)).filter(IsNotFalse);

  const invalidFields = result.length > 0 ? result : null;

  return {
    invalidFields,
    validType: invalidFields ? null : (obj as Valid),
  };
}
