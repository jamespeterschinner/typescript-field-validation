import 'mocha';
import { assert } from 'chai';
import { SetRequired } from '../src/set-required';
import { AssertTrue, IsExact } from 'conditional-type-checks';

type TestPassed<T> = [T] extends [never] ? true : false;

describe('SetRequired made option field required', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['a'] as const;
    type Base = { a?: any | null };
    type Expected = { a: any };
    type result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, result>>> = true;
    assert(result);
  });
});

describe('SetRequired made nested option field required', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['a.b'] as const;
    type Base = { a: { b?: any | null } };
    type Expected = { a: { b: any } };
    type result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, result>>> = true;
    assert(result);
  });
});

describe('SetRequired made nested.nested option field required', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['a.b.c'] as const;
    type Base = { a: { b: { c?: any | null | undefined } } };
    type Expected = { a: { b: { c: any } } };
    type result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, result>>> = true;
    assert(result);
  });
});

describe('SetRequired preserved base type when no required fields were set', () => {
  it('should not have compile errors', () => {
    const requiredFields = [] as const;
    type Base = { a?: any | null | undefined };
    type Expected = { a?: any };
    type result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, result>>> = true;
    assert(result);
  });
});

describe('SetRequired set field to be required for each array element', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['a[].b'] as const;
    type Base = { a: { b?: any | null | undefined }[] };
    type Expected = { a: { b: any | null | undefined }[] };
    type result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, result>>> = true;
    assert(result);
  });
});

describe('SetRequired set field to be required for each array element of an array element', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['a[].b[].c'] as const;
    type Base = { a?: { b?: { c?: any | null | undefined }[] }[] };
    type Expected = { a: { b: { c: any }[] }[] };
    type result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, result>>> = true;
    assert(result);
  });
});

describe('SetRequired set recursively defined type depth to be required', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['a.a.a.a'] as const;
    type Base = { a?: Base };
    type Expected = { a: { a: { a: { a: { a?: Base } } } } };
    type Result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, Result>>> = true;
    assert(result);
  });
});

describe('SetRequired picks out required fields from base type', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['b.c'] as const;
    type Base = { a?: any; b?: { c?: true | null | undefined } };
    type Expected = { a?: any; b: { c: true } };
    type Result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, Result>>> = true;
    assert(result);
  });
});

describe('SetRequired picks out required fields that is a nested array', () => {
  it('should not have compile errors', () => {
    const requiredFields = ['a[].b[].c[].d[].e'] as const;
    type Base = { a?: { b?: { c?: { d?: { e: true | null | undefined }[] }[] }[] }[]; f?: any };
    type Expected = { a: { b: { c: { d: { e: true }[] }[] }[] }[]; f?: any };
    type Result = SetRequired<Base, typeof requiredFields[number]>;
    const result: TestPassed<AssertTrue<IsExact<Expected, Result>>> = true;
    assert(result);
  });
});
