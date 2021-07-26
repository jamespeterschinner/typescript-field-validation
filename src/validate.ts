import { SetRequired } from "src";

function fieldRest(fields: string): [string, string | null] {
  const splitAt = fields.indexOf(".");
  if (splitAt === -1) {
    return [fields, null];
  }
  return [fields.slice(0, splitAt), fields.slice(splitAt + 1)];
}

function IsNotFalse<T>(value: T | false): value is T {
  return value !== false;
}

function validateField(
  objectOrArray: Record<string, any> | any[],
  firstRest: string,
  index?: number
): string | false {
  const [field, rest] = fieldRest(firstRest);

  const hasAttribute = objectOrArray.hasOwnProperty(field);

    const maybeIndex = index? `[${index}].` : ''

  if (!hasAttribute) {
    return `${maybeIndex}${field} is missing`;
  }
  const value = (objectOrArray as Record<string, any>)[field];

  if (value === null) {
    return `${maybeIndex}${field} is null`;
  } else if (value === undefined) {
    return `${maybeIndex}${field} is undefined`;
  } else if (rest) {
    if (Array.isArray(value)) {
      const missingFields = value
        .map((item, index) => validateField(item, rest, index))
        .filter(IsNotFalse);
    if (missingFields.length > 0){
        return `${field}.${missingFields.join(' and .')}`
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

export function invalidFields<
  T extends Record<string, any>,
  R extends readonly string[],
  Valid extends SetRequired<T, R[number]>
>(obj: T | Valid, required: R): string[] | null {
  const result = required
    .map((fieldRest) => validateField(obj, fieldRest))
    .filter(IsNotFalse);

  return result.length > 0 ? result : null;
}
