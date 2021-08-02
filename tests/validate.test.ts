import 'mocha';
import { SetRequired, validate } from '../src';
import { expect } from 'chai';

import { ExampleType } from './example-data-type';
const exampleData = require('./example-data.json');

describe('validate returns valid type when no fields are required', () => {
  it('should return the validType in the result', () => {
    expect(validate({ a: 1234 }, []).validType).to.eql({ a: 1234 });
  });
});

describe('validate returns valid type when required fields are present', () => {
  it('should return the valid data', () => {
    expect(validate({ a: 1 }, ['a'])).to.eql({ invalidFields: null, validType: { a: 1 } });
    expect(validate({ a: { b: 1 } }, ['a.b'])).to.eql({ invalidFields: null, validType: { a: { b: 1 } } });

    const validExample3 = { a: { b: [{ c: 1 }, { c: 2 }] } };
    expect(validate(validExample3, ['a.b[].c'])).to.eql({ invalidFields: null, validType: validExample3 });

    const validExample4 = { ...validExample3, d: { e: [{ f: [{ g: true }] }] } };
    expect(validate(validExample4, ['a.b[].c', 'd.e[].f[].g'])).to.eql({
      invalidFields: null,
      validType: validExample4,
    });
  });
});

describe('validate returns missing field at single depth', () => {
  it('should list the missing field', () => {
    const requiredFields = ['a'] as const;
    expect(validate({}, requiredFields).invalidFields).to.eql({ a: 'is missing' });
    expect(validate({ a: null }, requiredFields).invalidFields).to.eql({ a: 'is null' });
    expect(validate({ a: undefined }, requiredFields).invalidFields).to.eql({ a: 'is undefined' });
  });
  it('should list all the missing fields', () => {
    const requiredFields = ['a', 'b'] as const;
    expect(validate({}, requiredFields).invalidFields).to.eql({ a: 'is missing', b: 'is missing' });
    expect(validate({ a: null, b: null }, requiredFields).invalidFields).to.eql({ a: 'is null', b: 'is null' });
    expect(validate({ a: undefined, b: undefined }, requiredFields).invalidFields).to.eql({
      a: 'is undefined',
      b: 'is undefined',
    });
  });
  it('should list the first missing field', () => {
    const requiredFields = ['a', 'b'] as const;
    expect(validate({}, requiredFields, { failFast: true }).invalidFields).to.eql({ a: 'is missing' });
    expect(validate({ a: null }, requiredFields, { failFast: true }).invalidFields).to.eql({ a: 'is null' });
    expect(validate({ a: undefined }, requiredFields, { failFast: true }).invalidFields).to.eql({
      a: 'is undefined',
    });
  });
});

describe('validate returns missing field at 2nd depth', () => {
  it('should list the missing field', () => {
    const requiredFields = ['a.b'] as const;
    expect(validate({ a: {} }, requiredFields).invalidFields).to.eql({ 'a.b': 'is missing' });
    expect(validate({ a: { b: null } }, requiredFields).invalidFields).to.eql({ 'a.b': 'is null' });
    expect(validate({ a: { b: undefined } }, requiredFields).invalidFields).to.eql({ 'a.b': 'is undefined' });
    expect(validate({ a: { b: undefined } }, ['c', 'a.b']).invalidFields).to.eql({
      c: 'is missing',
      'a.b': 'is undefined',
    });
  });
});

describe('validate returns missing field at 3rd depth', () => {
  it('should list the missing field', () => {
    const requiredFields = ['a.b.c'] as const;
    expect(validate({ a: { b: {} } }, requiredFields).invalidFields).to.eql({ 'a.b.c': 'is missing' });
    expect(validate({ a: { b: { c: null } } }, requiredFields).invalidFields).to.eql({ 'a.b.c': 'is null' });
    expect(validate({ a: { b: { c: undefined } } }, requiredFields).invalidFields).to.eql({ 'a.b.c': 'is undefined' });
  });
});

describe('validate returns missing field on array element', () => {
  it('should list the missing field with the index', () => {
    const requiredFields = ['a[].b'] as const;
    expect(validate({ a: [{}] }, requiredFields).invalidFields).to.eql({ 'a[0].b': 'is missing' });
    expect(validate({ a: [{ b: null }] }, requiredFields).invalidFields).to.eql({ 'a[0].b': 'is null' });
    expect(validate({ a: [{ b: undefined }] }, requiredFields).invalidFields).to.eql({ 'a[0].b': 'is undefined' });
    expect(validate({ a: [{ b: undefined }] }, ['c', 'a[].b']).invalidFields).to.eql({
      c: 'is missing',
      'a[0].b': 'is undefined',
    });
  });
  it('should list the missing field without the index', () => {
    const requiredFields = ['a[].b'] as const;
    expect(validate({ a: [{}] }, requiredFields, { includeIndex: false }).invalidFields).to.eql({
      'a[].b': 'is missing',
    });
    expect(validate({ a: [{ b: null }] }, requiredFields, { includeIndex: false }).invalidFields).to.eql({
      'a[].b': 'is null',
    });
    expect(validate({ a: [{ b: undefined }] }, requiredFields, { includeIndex: false }).invalidFields).to.eql({
      'a[].b': 'is undefined',
    });
  });
  it('should list the missing field with the index by default', () => {
    const requiredFields = ['a[].b'] as const;
    expect(validate({ a: [{}] }, requiredFields, { includeIndex: true })).to.eql(validate({ a: [{}] }, requiredFields));
    expect(validate({ a: [{ b: null }] }, requiredFields, { includeIndex: true })).to.eql(
      validate({ a: [{ b: null }] }, requiredFields),
    );
    expect(validate({ a: [{ b: undefined }] }, requiredFields, { includeIndex: true })).to.eql(
      validate({ a: [{ b: undefined }] }, requiredFields),
    );
  });
});

describe('validate performs breadth first search', () => {
  it('should identify a missing field at 0 depth before finding one at a higher depth', () => {
    const requiredFields = ['a.b', 'c'] as const;
    expect(validate({ a: {} }, requiredFields, { failFast: true }).invalidFields).to.eql({ c: 'is missing' });
    expect(validate({ a: {}, c: null }, requiredFields, { failFast: true }).invalidFields).to.eql({ c: 'is null' });
    expect(validate({ a: {}, c: undefined }, requiredFields, { failFast: true }).invalidFields).to.eql({
      c: 'is undefined',
    });
  }),
    it('should identify a missing field at 1 depth before finding one at a higher depth', () => {
      const requiredFields = ['a.b.c', 'd.e'] as const;
      expect(validate({ a: { b: {} }, d: {} }, requiredFields, { failFast: true }).invalidFields).to.eql({
        'd.e': 'is missing',
      });
      expect(validate({ a: { b: {} }, d: { e: null } }, requiredFields, { failFast: true }).invalidFields).to.eql({
        'd.e': 'is null',
      });
      expect(validate({ a: { b: {} }, d: { e: undefined } }, requiredFields, { failFast: true }).invalidFields).to.eql({
        'd.e': 'is undefined',
      });
    });
});

describe('validate returns missing fields on array element with multiple indices', () => {
  it('should list the missing fields', () => {
    const requiredFields = ['a[].b', 'a[].c'] as const;
    expect(validate({ a: [{}] }, requiredFields).invalidFields).to.eql({
      'a[0].b': 'is missing',
      'a[0].c': 'is missing',
    });
    expect(validate({ a: [{ b: null }, { c: null }] }, requiredFields).invalidFields).to.eql({
      'a[0].b': 'is null',
      'a[0].c': 'is missing',
      'a[1].b': 'is missing',
      'a[1].c': 'is null',
    });
    expect(validate({ a: [{ b: undefined }, { c: undefined }] }, requiredFields).invalidFields).to.eql({
      'a[0].b': 'is undefined',
      'a[0].c': 'is missing',
      'a[1].b': 'is missing',
      'a[1].c': 'is undefined',
    });
    expect(validate({ a: [{}] }, requiredFields, { includeIndex: false }).invalidFields).to.eql({
      'a[].b': 'is missing',
      'a[].c': 'is missing',
    });
    expect(validate({ a: [{ b: null }, { c: null }] }, requiredFields, { includeIndex: false }).invalidFields).to.eql({
      'a[].b': 'is missing',
      'a[].c': 'is null',
    });
    expect(
      validate({ a: [{ b: undefined }, { c: undefined }] }, requiredFields, { includeIndex: false }).invalidFields,
    ).to.eql({
      'a[].b': 'is missing',
      'a[].c': 'is undefined',
    });
  });
});

describe('validate detects shape differences between required fields and actual data', () => {
  it('should indicate field is not an array, but is required to be so', () => {
    expect(validate({ a: 1 }, ['a[]']).invalidFields).to.eql({ a: 'is required to be an array, but is a number' });
    expect(validate({ b: 1 }, ['a', 'b[]']).invalidFields).to.eql({
      a: 'is missing',
      b: 'is required to be an array, but is a number',
    });
    expect(validate({ b: [] }, ['a', 'b.c']).invalidFields).to.eql({
      a: 'is missing',
      b: 'is required to be an object, but is an array',
    });
  });
});

describe('validate detects shape differences between required fields and actual data', () => {
  it('should indicate field is an array, but is required to be an object', () => {
    expect(validate({ a: [] }, ['a.b']).invalidFields).to.eql({ a: 'is required to be an object, but is an array' });
  });
});

describe('validate doesnt care if a field is an array when not explicitly required', () => {
  it('should return valid type', () => {
    expect(validate({ a: [] }, ['a']).validType).to.eql({ a: [] });
  });
});

describe('validate detects nested shape differences between required fields and actual data', () => {
  it('should indicate field is an array, but is required to be an object', () => {
    expect(validate({ a: { b: [] } }, ['a.b.c']).invalidFields).to.eql({
      'a.b': 'is required to be an object, but is an array',
    });
    expect(validate({ a: [{ b: { c: [] } }] }, ['a[].b.c.d']).invalidFields).to.eql({
      'a[0].b.c': 'is required to be an object, but is an array',
    });
    expect(validate({ a: [{ b: { c: [] } }] }, ['a[].b.c.d'], { includeIndex: false }).invalidFields).to.eql({
      'a[].b.c': 'is required to be an object, but is an array',
    });

    expect(validate({ a: { b: [{ c: [] }] } }, ['a.b[].c.d']).invalidFields).to.eql({
      'a.b[0].c': 'is required to be an object, but is an array',
    });

    expect(validate({ a: { b: [{ c: [] }] } }, ['a.b[].c.d'], { includeIndex: false }).invalidFields).to.eql({
      'a.b[].c': 'is required to be an object, but is an array',
    });
  });
});

describe('Test validate with real world example', () => {
  const requiredFields = [
    'items[]._id',
    'items[].index',
    'items[].guid',
    'items[].isActive',
    'items[].balance',
    'items[].picture',
    'items[].age',
    'items[].eyeColor',
    'items[].name',
    'items[].gender',
    'items[].company',
    'items[].email',
    'items[].phone',
    'items[].address',
    'items[].about',
    'items[].registered',
    'items[].latitude',
    'items[].longitude',
    'items[].tags[]',
    'items[].friends[].id',
    'items[].friends[].name',
    'items[].greeting',
    'items[].favoriteFruit',
  ] as const;
  type ValidExampleData = SetRequired<ExampleType, typeof requiredFields[number]>;
  it('should validate the example data against the required fields', () => {
    const result: ValidExampleData | null = validate(exampleData, requiredFields).validType;
    expect(result).to.eql(exampleData);
  });

  it('should return missing field', () => {
    const result = validate(exampleData, [...requiredFields, 'items[].friends[].value'], {
      failFast: true,
      includeIndex: false,
    });
    expect(result).to.eql({ invalidFields: { 'items[].friends[].value': 'is missing' }, validType: null });
  });

  it('should return missing field with index', () => {
    const result = validate(exampleData, [...requiredFields, 'items[].friends[].value'], {
      failFast: true,
    });
    expect(result).to.eql({ invalidFields: { 'items[0].friends[0].value': 'is missing' }, validType: null });
  });
});
