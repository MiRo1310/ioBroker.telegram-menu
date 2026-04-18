import { expect } from 'chai';
import {
    isMenuBack,
    isDeleteMenu,
    isCreateSwitch,
    isFirstMenuValue,
    isSecondMenuValue,
    isCreateDynamicSwitch,
    isSetDynamicSwitchVal,
    isSubmenuOrMenu,
    isCreateSubmenuPercent,
    isSetSubmenuPercent,
    isSetSubmenuNumber,
    isCreateSubmenuNumber,
} from '@backend/app/validateMenus';

describe('validateMenus', () => {
    describe('isMenuBack', () => {
        it('should return true if string contains menu:back', () => {
            expect(isMenuBack('menu:back')).to.be.true;
        });
        it('should return false if string does not contain menu:back', () => {
            expect(isMenuBack('menu:home')).to.be.false;
        });
    });

    describe('isDeleteMenu', () => {
        it('should return true if string contains delete', () => {
            expect(isDeleteMenu('delete item')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isDeleteMenu('create item')).to.be.false;
        });
    });

    describe('isCreateSwitch', () => {
        it('should return true if string contains switch', () => {
            expect(isCreateSwitch('menu:switch')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isCreateSwitch('menu:back')).to.be.false;
        });
    });

    describe('isFirstMenuValue', () => {
        it('should return true if string contains first', () => {
            expect(isFirstMenuValue('first option')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isFirstMenuValue('second option')).to.be.false;
        });
    });

    describe('isSecondMenuValue', () => {
        it('should return true if string contains second', () => {
            expect(isSecondMenuValue('second option')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isSecondMenuValue('first option')).to.be.false;
        });
    });

    describe('isCreateDynamicSwitch', () => {
        it('should return true if string contains dynSwitch', () => {
            expect(isCreateDynamicSwitch('dynSwitch:on')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isCreateDynamicSwitch('switch:on')).to.be.false;
        });
    });

    describe('isSetDynamicSwitchVal', () => {
        it('should return true if string contains dynS', () => {
            expect(isSetDynamicSwitchVal('dynSwitch')).to.be.true;
            expect(isSetDynamicSwitchVal('dynS:val')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isSetDynamicSwitchVal('switch')).to.be.false;
        });
    });

    describe('isSubmenuOrMenu', () => {
        it('should return true if starts with menu', () => {
            expect(isSubmenuOrMenu('menu:back')).to.be.true;
        });
        it('should return true if starts with submenu', () => {
            expect(isSubmenuOrMenu('submenu:percent')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isSubmenuOrMenu('delete')).to.be.false;
        });
    });

    describe('isCreateSubmenuPercent', () => {
        it('should return true if menuString has no submenu and cbData contains percent', () => {
            expect(isCreateSubmenuPercent('menu:number', 'percent:10')).to.be.true;
        });
        it('should return false if menuString contains submenu', () => {
            expect(isCreateSubmenuPercent('submenu:percent5', 'percent:10')).to.be.false;
        });
        it('should return false if cbData does not contain percent', () => {
            expect(isCreateSubmenuPercent('menu:number', 'number:10')).to.be.false;
        });
    });

    describe('isSetSubmenuPercent', () => {
        it('should return true if menuString contains submenu:percent{step}', () => {
            expect(isSetSubmenuPercent('submenu:percent5', 5)).to.be.true;
        });
        it('should return false if step does not match', () => {
            expect(isSetSubmenuPercent('submenu:percent5', 10)).to.be.false;
        });
    });

    describe('isSetSubmenuNumber', () => {
        it('should return true if menuString contains submenu:number', () => {
            expect(isSetSubmenuNumber('submenu:number10')).to.be.true;
        });
        it('should return false otherwise', () => {
            expect(isSetSubmenuNumber('submenu:percent5')).to.be.false;
        });
    });

    describe('isCreateSubmenuNumber', () => {
        it('should return true if menuString has no submenu and callbackData contains number', () => {
            expect(isCreateSubmenuNumber('menu:back', 'number:10')).to.be.true;
        });
        it('should return false if menuString contains submenu', () => {
            expect(isCreateSubmenuNumber('submenu:number5', 'number:10')).to.be.false;
        });
        it('should return false if callbackData does not contain number', () => {
            expect(isCreateSubmenuNumber('menu:back', 'percent:10')).to.be.false;
        });
    });
});
