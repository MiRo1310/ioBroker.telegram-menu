"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const time_1 = require("../../src/lib/time");
describe('toLocaleDate', () => {
    it('sollte ein korrekt formatiertes Datum zurückgeben', () => {
        const testDate = new Date('2023-03-15T14:30:45Z'); // Beispiel-Datum
        const result = (0, time_1.toLocaleDate)(testDate);
        // Erwartetes Format: "15.03.2023, 14:30:45"
        (0, chai_1.expect)(result).to.equal('15.03.2023, 14:30:45');
    });
    it('sollte keine Fehler werfen, wenn ein ungültiges Datum übergeben wird', () => {
        const invalidDate = new Date('invalid-date');
        (0, chai_1.expect)(() => (0, time_1.toLocaleDate)(invalidDate)).to.not.throw();
    });
});
//# sourceMappingURL=time.test.js.map