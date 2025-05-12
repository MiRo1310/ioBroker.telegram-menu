import {expect} from 'chai';
import {extractTimeValues, getTimeWithPad, integrateTimeIntoText, toLocaleDate} from '../../src/lib/time';
import {config} from '../../src/config/config';

describe('Time', () => {
    const testDate = new Date(1744388803096);
    const expectedDate = '11.4.2025, 18:26:43';

    // FIXME : Test gets error Timeout of 2000ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves.
    // it('Should return a correct formatted date', function () {
    //     this.timeout(5000); // Timeout auf 5000ms erhöhen
    //     const result = toLocaleDate(testDate, {locale:'de-DE', tz:'Europe/Berlin'});
    //     expect(result).to.equal(expectedDate);
    // });

    it('Should not throw an exception, if no valid date', () => {
        const invalidDate = new Date('invalid-date');
        expect(() => toLocaleDate(invalidDate)).to.not.throw();
    });

    it('Integrate a valid time into text', () => {
        const result = integrateTimeIntoText(`Test at ${config.time} created`, 1744388803096);
        expect(result).to.equal(`Test at ${expectedDate} created`);
    });

    it('Handle a non valid time', () => {
        const result = integrateTimeIntoText(`Test at ${config.time} created`, 'abc');
        expect(result).to.equal(`Test at "Invalid Date" created`);
    });

    it('Handle a null value for time', () => {
        [null, undefined].forEach(value => {
            const result = integrateTimeIntoText(`Test at ${config.time} created`, value);
            expect(result).to.equal(`Test at "Invalid Date" created`);
        });
    });
});

describe('extractTimeValues', () => {
    it('should correctly extract time values from a valid timestamp', () => {
        const timestamp = 1744388803096; // Corresponds to 11.4.2025, 18:26:43.096
        const result = extractTimeValues(timestamp);
        expect(result).to.deep.equal({
            milliseconds: 96,
            seconds: 43,
            minutes: 26,
            hours: 18,
            day: 11,
            month: 4,
            year: 2025,
        });
    });

    it('should handle a timestamp of 0 (Unix epoch)', () => {
        const timestamp = 0; // 1.1.1970, 00:00:00.000
        const result = extractTimeValues(timestamp);
        expect(result).to.deep.equal({
            milliseconds: 0,
            seconds: 0,
            minutes: 0,
            hours: 1,
            day: 1,
            month: 1,
            year: 1970,
        });
    });

    it('should handle a negative timestamp (before Unix epoch)', () => {
        const timestamp = -3600000;
        const result = extractTimeValues(timestamp);
        expect(result).to.deep.equal({
            milliseconds: NaN,
            seconds: NaN,
            minutes: NaN,
            hours: NaN,
            day: NaN,
            month: NaN,
            year: NaN,
        });
    });

    it('should return NaN for all values if the timestamp is invalid', () => {
         const result = extractTimeValues(NaN);
        expect(result).to.deep.equal({
            milliseconds: NaN,
            seconds: NaN,
            minutes: NaN,
            hours: NaN,
            day: NaN,
            month: NaN,
            year: NaN,
        });
    });

    it('should handle a very large timestamp', () => {
        const timestamp = 8640000000000;
        const result = extractTimeValues(timestamp);
        expect(result).to.deep.equal({
            milliseconds: 0,
            seconds: 0,
            minutes: 0,
            hours: 2,
            day: 17,
            month: 10,
            year: 2243,
        });
    });
});

describe('getTimeWithPad', () => {
    it('should correctly pad all time values', () => {
        const input = {
            milliseconds: 5,
            seconds: 9,
            minutes: 3,
            hours: 7,
            day: 1,
            month: 2,
            year: 2023,
        };
        const result = getTimeWithPad(input);
        expect(result).to.deep.equal({
            ms: '005',
            s: '09',
            m: '03',
            h: '07',
            d: '01',
            mo: '02',
            y: '2023',
        });
    });

    it('should handle already padded values', () => {
        const input = {
            milliseconds: 123,
            seconds: 45,
            minutes: 30,
            hours: 12,
            day: 15,
            month: 10,
            year: 2025,
        };
        const result = getTimeWithPad(input);
        expect(result).to.deep.equal({
            ms: '123',
            s: '45',
            m: '30',
            h: '12',
            d: '15',
            mo: '10',
            y: '2025',
        });
    });

    it('should handle edge cases with zero values', () => {
        const input = {
            milliseconds: 0,
            seconds: 0,
            minutes: 0,
            hours: 0,
            day: 0,
            month: 0,
            year: 0,
        };
        const result = getTimeWithPad(input);
        expect(result).to.deep.equal({
            ms: '000',
            s: '00',
            m: '00',
            h: '00',
            d: '00',
            mo: '00',
            y: '0',
        });
    });

    it('should handle large year values', () => {
        const input = {
            milliseconds: 1,
            seconds: 1,
            minutes: 1,
            hours: 1,
            day: 1,
            month: 1,
            year: 9999,
        };
        const result = getTimeWithPad(input);
        expect(result).to.deep.equal({
            ms: '001',
            s: '01',
            m: '01',
            h: '01',
            d: '01',
            mo: '01',
            y: '9999',
        });
    });
});