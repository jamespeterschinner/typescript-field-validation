# typescript-field-validation

[![Build Status](https://travis-ci.com/jamespeterschinner/typescript-field-validation.svg?branch=master)](https://travis-ci.com/jamespeterschinner/typescript-field-validation)

Basic tools for NonNullable type manipulation and validation.

There are two tools exposed in this library which are designed to work together:

- `SetRequired` (conditional type)
- `validate` (function)

`SetRequired` allows you to take a type and declare fields to be `Required` and `NonNullable`.

`validate` checks if the required fields are present and not `null` or `undefined.`

Both `SetRequired` and `validate` use the same syntax for requiring fields. This means you can perform type manipulations and data validation by decalring the required fields once.

## Syntax

To specify a field as being required simply use that fields name. To specify a sub field on a field use dot notation `field.subField`. To specify a required field for every object in a field that is an array use `[]`. For example `fieldOne[].subField` would mean that `fieldOne` is an array and every member of that array needs to have a `subField`.

<br/>

## Example usage

<br/>

```typescript
import { validate, SetRequired } from 'typescript-field-validation';

type TypeWithOptionalFields = {
  id?: string;
  item?: {
    items?: { id?: string; value: any | null }[];
  };
  link?: string;
  date?: number;
};

const requiredFields = ['id', 'item.items[].id', 'item.items[].value', 'date'] as const;

type TypeWithNonOptionFields = SetRequired<TypeWithOptionalFields, typeof requiredFields[number]>;

const invalidData = {
  id: '12345',
  item: {
    items: [{ value: 'hello world' }],
  },
};

// Default: Provides maximum information regarding what fields were missing
const result1 = validate(invalidData, requiredFields);
console.log('Default', result1);
/**
{
  invalidFields: { date: 'is missing', 'item.items[0].id': 'is missing' },
  validType: null
}
 */

// No index: Removes the array index for missing fields.
const result2 = validate(invalidData, requiredFields, {
  includeIndex: false,
});
console.log('No array index', result2);
/**
{
  invalidFields: { date: 'is missing', 'item.items[].id': 'is missing' },
  validType: null
}
*/

// Fail fast: Returns the first failure at the lowest depth
const result3 = validate(invalidData, requiredFields, {
  failFast: true,
});
console.log(result3);
/**
 { invalidFields: { date: 'is missing' }, validType: null }
 */

// Raw fields: Returns an error object whose shape mimicks the data
const result4 = validate(invalidData, requiredFields, {
  rawFields: true,
});
console.log(JSON.stringify(result4, null, 2));
/**
 {
  "invalidFields": {
    "date": "is missing",
    "item": {
      "items": [
        {
          "id": "is missing"
        }
      ]
    }
  },
  "validType": null
}
 */

const validData = {
  id: '12345',
  item: {
    items: [{ id: 'myId', value: 'hello world' }],
  },
  date: 1627787814504,
};

const result5: TypeWithNonOptionFields | null = validate(validData, requiredFields).validType;

if (result5) {
  console.log(true);
  // true
}
```

<br/>

---

<br/>

###### A note of warning: This tool does not check that the values of the required fields are of the type defined by the base type, this is assumed to be correct. Rather, it simply makes a field required and removes `undefined | null` from the fields union type.

<br>

---

<br/>

## CHANGELOG

<br/>

- 2.0.1: Fix: failFast option returns single result for array fields.

- 2.0.0:

  - `validate` function uses a breadth first search over a generated search graph
  - `validate` function takes additional parameters to failFast and other formatting options of error messages

  ### Breaking changes:

  - Package now targets `es2019`
  - `validate` now returns missing fields as a `Record<field, error message>`
  - `validate` now optionally returns missing fields in the same shape as the provided data when the `rawFields` option is set to `true`.

<br/>

- 1.1.2:
  Add MIT license

- 1.1.1:
  Update Result type to be a exclusive or union of pass or fail types

- 1.1.0:
  Improve error messages and add additional checks for object vs array fields

- 1.0.1:
  Update readme
