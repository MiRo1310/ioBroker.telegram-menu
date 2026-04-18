import { expect } from 'chai';
import { isParseModeFirstElement } from '../../../src/app/parseMode';
import type { Part } from '@backend/types/types';

describe('parseMode', () => {
    it('should return parse_mode from first getData element', () => {
        const part: Part = { getData: [{ parse_mode: true, id: 'x', text: 'y', newline: 'false' }] };
        expect(isParseModeFirstElement(part)).to.equal(true);
    });

    it('should return false if parse_mode is false', () => {
        const part: Part = { getData: [{ parse_mode: false, id: 'x', text: 'y', newline: 'false' }] };
        expect(isParseModeFirstElement(part)).to.equal(false);
    });

    it('should return undefined if getData is undefined', () => {
        const part: Part = {};
        expect(isParseModeFirstElement(part)).to.be.undefined;
    });
});

