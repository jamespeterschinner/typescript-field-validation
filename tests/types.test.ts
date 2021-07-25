import { SetRequired } from "src";

describe("Typescript allows type assertion", () => {
  it("Should not have any type errors", () => {
    type Test = { a?: { b?: { c?: { d?: number } } } };

    const testType1RequiredFields = ["a.b.c.d"] as const;
    type ValidTest = SetRequired<Test, typeof testType1RequiredFields[number]>;
    const result = { a: { b: { c: { d: 1 } } } } as ValidTest;

    console.log(result);
  });
});

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
//       firstName: "a",
//       lastName: "b",
//       dependant: [
//         {
//           firstName: "max",
//           lastName: "b",
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
