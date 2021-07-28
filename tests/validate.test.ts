import 'mocha';
import { validate } from "../src";
import { expect } from "chai";


describe('validate returns missing field at single depth', () => {
    it('should list the missing field', () => {
        const requiredFields = ['a'] as const;
        expect(validate({}, requiredFields).invalidFields).to.eql(['a is missing'])
        expect(validate({a: null}, requiredFields).invalidFields).to.eql(['a is null'])
        expect(validate({a: undefined}, requiredFields).invalidFields).to.eql(['a is undefined'])
    })
})


describe('validate returns missing field at 2nd depth', () => {
    it('should list the missing field', () => {
        const requiredFields = ['a.b'] as const;
        expect(validate({a: {}}, requiredFields).invalidFields).to.eql(['a.b is missing'])
        expect(validate({a: {b: null }}, requiredFields).invalidFields).to.eql(['a.b is null'])
        expect(validate({a: {b: undefined}}, requiredFields).invalidFields).to.eql(['a.b is undefined'])
    })
})

describe('validate returns missing field at 3rd depth', () => {
    it('should list the missing field', () => {
        const requiredFields = ['a.b.c'] as const;
        expect(validate({a: {b: {}}}, requiredFields).invalidFields).to.eql(['a.b.c is missing'])
        expect(validate({a: {b: {c: null} }}, requiredFields).invalidFields).to.eql(['a.b.c is null'])
        expect(validate({a: {b: {c: undefined}}}, requiredFields).invalidFields).to.eql(['a.b.c is undefined'])
    })
})

describe('validate returns valid type when no fields are required', () => {
    it('should return the validType in the result', () => {
        expect(validate({}, []).validType).to.eql({})
    })
})

describe('validate returns missing field on array element', () => {
    it('should list the missing field', () => {
        const requiredFields = ['a[].b'] as const;
        expect(validate({a: [{}]}, requiredFields).invalidFields).to.eql(['a[0].b is missing'])
        expect(validate({a: [{b: null}]}, requiredFields).invalidFields).to.eql(['a[0].b is null'])
        expect(validate({a: [{b: undefined}]}, requiredFields).invalidFields).to.eql(['a[0].b is undefined'])
    })
})

describe('validate returns missing fields on array element with multiple indices', () => {
    it('should list the missing fields', () => {
        const requiredFields = ['a[].b', 'a[].c'] as const;
        expect(validate({a: [{}]}, requiredFields).invalidFields).to.eql(['a[0].b is missing', 'a[0].c is missing'])
        expect(validate({a: [{b: null}, {c: null}]}, requiredFields).invalidFields).to.eql(['a[0].b is null and a[1].b is missing', 'a[0].c is missing and a[1].c is null'])
        expect(validate({a: [{b: undefined}, {c: undefined}]}, requiredFields).invalidFields).to.eql(['a[0].b is undefined and a[1].b is missing', 'a[0].c is missing and a[1].c is undefined'])
    })
})