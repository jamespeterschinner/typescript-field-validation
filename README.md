# typescript-field-validation

Simple to use tool for basic `NonNullable` field validation when parsing data from an API.

If you have autogeneated TS types from an openAPI schema, it's likely that many fields your application requires are defined as optional in the specification.

There are two tools exposed in this library which are designed to work together. The first tool is a conditional type `SetRequired` which allows you to take the types generated from the schema and declare specific fields to be `Required` the second tool is a generic function `invalidFields` which returns the missing fields. `SetRequired` and `invalidFields` both take a `readonly string[]` as their second argument which is an array of required fields. This commonality allows you to declare the data your application expects once, and provides you with both the types and means to validate those types.

The `invalidFields` function returns an array of missing fields, it is up to the user to use this data to customize error / warning messages or optionally assert the passed data is the `SetRequired` type.

A note of warning, this tool does not check that the values of the required fields are of the type defined by the base schema, this is assumed to be correct. Rather it simply removes undefined and null from a field's union type.
