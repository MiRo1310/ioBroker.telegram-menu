import { expect } from 'chai';
import { toLocaleDate, integrateTimeIntoText } from '../../src/lib/time';
import {config} from '../../src/config/config';

describe('toLocaleDate', () => {
        const testDate = new Date(1744388803096);
        const expectedDate = '11.4.2025, 18:26:43';

    it('Should return a correct formatted date', () => {
        const result = toLocaleDate(testDate);
        expect(result).to.equal(expectedDate);
    });

    it('Should not throw an exception, if no valid date', () => {
        const invalidDate = new Date('invalid-date');
        expect(() => toLocaleDate(invalidDate)).to.not.throw();
    });

    it("Integrate a valid time into text", ()=>{
        const result = integrateTimeIntoText(`Test at ${config.replacer.time} created`, 1744388803096);
        expect(result).to.equal(`Test at ${expectedDate} created`);
    })

    it("Handle a non valid time", ()=>{
        const result = integrateTimeIntoText(`Test at ${config.replacer.time} created`, "abc");
        expect(result).to.equal(`Test at "Invalid Date" created`);
    })
});