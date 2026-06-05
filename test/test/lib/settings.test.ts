import { expect } from 'chai';
import {
    shouldDefaultSendMenuAfterRestart,
    getCheckboxDisplayValue,
    getUpdatedCheckboxes,
    getUpdatedInstanceList,
} from '../../../admin/src/lib/settings';
import type { Checkboxes, InstanceList } from '../../../admin/src/types/app';

const defaultCheckboxes: Checkboxes = {
    oneTiKey: false,
    resKey: false,
    checkboxNoValueFound: false,
    sendMenuAfterRestart: true,
};

describe('settings', () => {
    describe('shouldDefaultSendMenuAfterRestart', () => {
        it('gibt true zurück wenn Wert undefined ist (noch nie gespeichert)', () => {
            expect(shouldDefaultSendMenuAfterRestart(undefined)).to.be.true;
        });
        it('gibt true zurück wenn Wert null ist', () => {
            expect(shouldDefaultSendMenuAfterRestart(null)).to.be.true;
        });
        it('gibt false zurück wenn Nutzer die Checkbox bewusst deaktiviert hat (false)', () => {
            expect(shouldDefaultSendMenuAfterRestart(false)).to.be.false;
        });
        it('gibt false zurück wenn Wert bereits true ist', () => {
            expect(shouldDefaultSendMenuAfterRestart(true)).to.be.false;
        });
    });

    describe('getCheckboxDisplayValue', () => {
        it('gibt true zurück wenn Wert undefined ist (default anzeigen)', () => {
            expect(getCheckboxDisplayValue(undefined)).to.be.true;
        });
        it('gibt true zurück wenn Wert null ist', () => {
            expect(getCheckboxDisplayValue(null)).to.be.true;
        });
        it('gibt false zurück wenn Nutzer explizit false gesetzt hat', () => {
            expect(getCheckboxDisplayValue(false)).to.be.false;
        });
        it('gibt true zurück wenn Wert true ist', () => {
            expect(getCheckboxDisplayValue(true)).to.be.true;
        });
    });

    describe('getUpdatedCheckboxes', () => {
        it('setzt einen neuen Checkbox-Wert', () => {
            const result = getUpdatedCheckboxes(defaultCheckboxes, 'resKey', true);
            expect(result.resKey).to.be.true;
        });
        it('überschreibt einen vorhandenen Checkbox-Wert', () => {
            const result = getUpdatedCheckboxes(defaultCheckboxes, 'sendMenuAfterRestart', false);
            expect(result.sendMenuAfterRestart).to.be.false;
        });
        it('lässt andere Checkbox-Werte unverändert', () => {
            const result = getUpdatedCheckboxes(defaultCheckboxes, 'resKey', true);
            expect(result.oneTiKey).to.equal(defaultCheckboxes.oneTiKey);
            expect(result.checkboxNoValueFound).to.equal(defaultCheckboxes.checkboxNoValueFound);
        });
        it('mutiert das Original-Objekt nicht', () => {
            getUpdatedCheckboxes(defaultCheckboxes, 'resKey', true);
            expect(defaultCheckboxes.resKey).to.be.false;
        });
    });

    describe('getUpdatedInstanceList', () => {
        const allInstances = ['telegram.0', 'telegram.1', 'telegram.2'];
        const currentList: InstanceList[] = [
            { name: 'telegram.0', active: true },
            { name: 'telegram.1', active: false },
        ];

        it('aktualisiert den active-Status einer bestehenden Instanz', () => {
            const result = getUpdatedInstanceList(allInstances, currentList, 1, true);
            expect(result[1].active).to.be.true;
        });
        it('fügt eine neue Instanz hinzu wenn index außerhalb der Liste', () => {
            const result = getUpdatedInstanceList(allInstances, currentList, 2, true);
            expect(result[2]).to.deep.equal({ name: 'telegram.2', active: true });
        });
        it('funktioniert wenn currentList undefined ist (erste Konfiguration)', () => {
            const result = getUpdatedInstanceList(allInstances, undefined, 0, true);
            expect(result[0]).to.deep.equal({ name: 'telegram.0', active: true });
        });
        it('behält den Namen aus allInstances bei korrektem Index', () => {
            const result = getUpdatedInstanceList(allInstances, currentList, 0, false);
            expect(result[0].name).to.equal('telegram.0');
        });
    });
});
