import { SetRequired } from "src";
import { AssertTrue, IsExact } from "conditional-type-checks";

type TestPassed<T> = [T] extends [never] ? true : false

const test1RequiredFields = ["a"] as const;
type Test1Base = { a?: any | null };
type Test1Expected = { a: any };
type Test1Result = SetRequired<Test1Base, typeof test1RequiredFields[number]>;
const test1Value: TestPassed<AssertTrue<IsExact<Test1Expected, Test1Result>>> = true;

console.log(`SetRequired made option field required: ${test1Value}\n`);

const test2RequiredFields = ["a.b"] as const;
type Test2Base = { a: { b?: any | null } };
type Test2Expected = { a: { b: any } };
type Test2Result = SetRequired<Test2Base, typeof test2RequiredFields[number]>;
const test2Value: TestPassed<AssertTrue<IsExact<Test2Expected, Test2Result>>> = true;

console.log(`SetRequired made nested option field required: ${test2Value}\n`);

const test3RequiredFields = ["a.b.c"] as const;
type Test3Base = { a: { b: { c?: any | null | undefined } } };
type Test3Expected = { a: { b: { c: any } } };
type Test3Result = SetRequired<Test3Base, typeof test3RequiredFields[number]>;
const test3Value: TestPassed<AssertTrue<IsExact<Test3Expected, Test3Result>>> = true;

console.log(`SetRequired made nested.nested option field required: ${test3Value}\n`);

const test4RequiredFields = [] as const;
type Test4Base = { a?: any | null | undefined};
type Test4Expected = { a?: any };
type Test4Result = SetRequired<Test4Base, typeof test4RequiredFields[number]>;
const test4Value: TestPassed<AssertTrue<IsExact<Test4Expected, Test4Result>>> = true;

console.log(`SetRequired preserved base type when no required fields were set: ${test4Value}\n`);

const test5RequiredFields = ['a[].b'] as const;
type Test5Base = { a: { b?: any | null | undefined }[] };
type Test5Expected = { a: { b: any | null | undefined }[] };
type Test5Result = SetRequired<Test5Base, typeof test5RequiredFields[number]>;
const test5Value: TestPassed<AssertTrue<IsExact<Test5Expected, Test5Result>>> = true;

console.log(`SetRequired set field to be required for each array element: ${test5Value}\n`);

const test6RequiredFields = ['a[].b[].c'] as const;
type Test6Base = { a?: { b?: {c?: any | null | undefined} []}[]};
type Test6Expected = { a: { b: {c: any} []}[]};
type Test6Result = SetRequired<Test6Base, typeof test6RequiredFields[number]>;
const test6Value: TestPassed<AssertTrue<IsExact<Test6Expected, Test6Result>>> = true;

console.log(`SetRequired set field to be required for each array element of an array element: ${test6Value}\n`);

const test7RequiredFields = ['a.a.a.a'] as const;
type Test7Base = {a?: Test7Base}
type Test7Expected = { a: {a: {a: {a: {a?: Test7Base}}}}}
type Test7Result = SetRequired<Test7Base, typeof test7RequiredFields[number]>;
const test7Value: TestPassed<AssertTrue<IsExact<Test7Expected, Test7Result>>> = true;

console.log(`SetRequired set recursively defined type depth to be required: ${test7Value}\n`);
