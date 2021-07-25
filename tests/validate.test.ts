import { invalidFields } from "../src";
import { expect } from "chai";


describe('validate returns missing field', () => {
    it('should list the missing required fields', () => {
        const requiredFields = ['required'] as const;
        expect(invalidFields({}, requiredFields)).to.eql(['required is missing'])
    })
})