import { expect } from 'chai';
import { countItemsInArray, isNavigationRow } from '../../../admin/src/lib/dropboxUtils';

describe('dropboxUtils', () => {
    describe('countItemsInArray', () => {
        it('gibt 0 zurück wenn data undefined ist', () => {
            expect(countItemsInArray(undefined, 'foo')).to.equal(0);
        });
        it('gibt 0 zurück wenn Element nicht im Array ist', () => {
            expect(countItemsInArray(['a', 'b', 'c'], 'x')).to.equal(0);
        });
        it('zählt ein einzelnes Vorkommen korrekt', () => {
            expect(countItemsInArray(['Licht', 'Heizung', 'Licht'], 'Heizung')).to.equal(1);
        });
        it('zählt mehrere Vorkommen korrekt', () => {
            expect(countItemsInArray(['Licht', 'Licht', 'Heizung'], 'Licht')).to.equal(2);
        });
        it('ignoriert führende und nachfolgende Leerzeichen', () => {
            expect(countItemsInArray([' Licht ', 'Licht', 'Heizung'], 'Licht')).to.equal(2);
        });
    });

    describe('isNavigationRow', () => {
        it('gibt true zurück für ein Nav-Objekt mit call', () => {
            expect(isNavigationRow({ call: 'StartSide', text: 'test' })).to.be.true;
        });
        it('gibt false zurück wenn trigger vorhanden ist (Action-Row)', () => {
            expect(isNavigationRow({ call: 'StartSide', trigger: ['Licht'] })).to.be.false;
        });
        it('gibt false zurück für null', () => {
            expect(isNavigationRow(null)).to.be.false;
        });
        it('gibt false zurück für ein Objekt ohne call', () => {
            expect(isNavigationRow({ trigger: ['x'] })).to.be.false;
        });
        it('gibt false zurück für einen primitiven Wert', () => {
            expect(isNavigationRow('string')).to.be.false;
        });
    });
});
