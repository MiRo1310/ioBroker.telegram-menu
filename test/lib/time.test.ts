import { expect } from 'chai';
import { toLocaleDate } from '../../src/lib/time';

describe('toLocaleDate', () => {
    it('sollte ein korrekt formatiertes Datum zurückgeben', () => {
        const testDate = new Date('2023-03-15T14:30:45Z'); // Beispiel-Datum
        const result = toLocaleDate(testDate);

        // Erwartetes Format: "15.03.2023, 14:30:45"
        expect(result).to.equal('15.03.2023, 14:30:45');
    });

    it('sollte keine Fehler werfen, wenn ein ungültiges Datum übergeben wird', () => {
        const invalidDate = new Date('invalid-date');
        expect(() => toLocaleDate(invalidDate)).to.not.throw();
    });
});