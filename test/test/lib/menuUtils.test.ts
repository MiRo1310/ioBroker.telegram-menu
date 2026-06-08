import { expect } from 'chai';
import { menuNameExists, isInvalidNewMenuName } from '../../../admin/src/lib/menuUtils';
import type { MenusWithUsers } from '../../../admin/src/types/app';

const usersInGroup: MenusWithUsers = {
    Hauptmenu: [{ name: 'Michael', chatId: '123', instance: '' }],
    Licht: [{ name: 'Anna', chatId: '456', instance: '' }],
};

describe('menuUtils', () => {
    describe('menuNameExists', () => {
        it('gibt true zurück wenn Menü bereits existiert', () => {
            expect(menuNameExists('Hauptmenu', usersInGroup)).to.be.true;
        });
        it('gibt false zurück wenn Menü nicht existiert', () => {
            expect(menuNameExists('NeuesMenu', usersInGroup)).to.be.false;
        });
        it('gibt false zurück bei leerem Namen', () => {
            expect(menuNameExists('', usersInGroup)).to.be.false;
        });
        it('ersetzt Leerzeichen durch Unterstriche beim Vergleich', () => {
            const groupsWithUnderscore: MenusWithUsers = {
                Haupt_menu: [{ name: 'Michael', chatId: '123', instance: '' }],
            };
            expect(menuNameExists('Haupt menu', groupsWithUnderscore)).to.be.true;
        });
    });

    describe('isInvalidNewMenuName', () => {
        it('gibt true zurück wenn neuer Name leer ist', () => {
            expect(isInvalidNewMenuName('', 'AlterName')).to.be.true;
        });
        it('gibt true zurück wenn neuer Name gleich dem alten ist', () => {
            expect(isInvalidNewMenuName('Hauptmenu', 'Hauptmenu')).to.be.true;
        });
        it('gibt false zurück wenn neuer Name gültig und anders ist', () => {
            expect(isInvalidNewMenuName('NeuesMenu', 'AlterName')).to.be.false;
        });
    });
});
