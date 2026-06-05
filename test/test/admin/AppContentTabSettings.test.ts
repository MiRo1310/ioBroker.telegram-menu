import { expect } from 'chai';
import { shouldDefaultSendMenuAfterRestart } from '@/lib/settings';

// Regression-Test für den Bug in AppContentTabSettings.tsx componentDidMount:
// !value überschrieb ein bewusst gesetztes false wieder mit true,
// weil !false === true. Fix: !isDefined(value) initialisiert nur bei undefined/null.
describe('shouldDefaultSendMenuAfterRestart', () => {
    it('gibt true zurück wenn Wert noch nie gespeichert wurde (undefined)', () => {
        expect(shouldDefaultSendMenuAfterRestart(undefined)).to.be.true;
    });

    it('gibt true zurück wenn Wert null ist', () => {
        expect(shouldDefaultSendMenuAfterRestart(null)).to.be.true;
    });

    it('gibt false zurück wenn Nutzer die Checkbox bewusst deaktiviert hat (false)', () => {
        // Bug: !false === true → hätte updateNative fälschlich ausgelöst
        // Fix: !isDefined(false) === false → updateNative wird nicht aufgerufen
        expect(shouldDefaultSendMenuAfterRestart(false)).to.be.false;
    });

    it('gibt false zurück wenn Wert bereits true ist', () => {
        expect(shouldDefaultSendMenuAfterRestart(true)).to.be.false;
    });
});