// import { SetRequired } from 'src';

// type TestType1 = { a?: { b?: { c?: { d?: number } } } };

// const testType1RequiredFields = ["a.b.c.d"] as const;

// type ValidTestType1 = SetRequired<
//   TestType1,
//   typeof testType1RequiredFields[number]
// >;


// const result = { a: { b: { c: { d: 1 } } } } as ValidTestType1;

// type Person = {
//   firstName: string;
//   lastName: string;
//   dependant?: Person[];
// };

// const person: Person = { firstName: "james", lastName: "schinner" };

// type PersonWithDependant = SetRequired<Person, "dependant.dependant">;

// const personWithDependant: PersonWithDependant = {
//   firstName: "james",
//   lastName: "schinner",
//   dependant: [
//     {
//       firstName: "lydia",
//       lastName: "McCloskey",
//       dependant: [
//         {
//           firstName: "max",
//           lastName: "McCloskey",
//         },
//       ],
//     },
//   ],
// };

// type Persons = SetRequired<Person, "dependant">;

// type Test = Person[] | undefined extends (infer U)[]
//   ? "dependant" extends keyof U
//     ? true
//     : false
//   : false;

// type Test2 = Field<"dependant">;
