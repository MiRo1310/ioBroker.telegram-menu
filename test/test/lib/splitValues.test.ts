import { describe, it } from 'mocha';
import { expect } from 'chai';
import { getBindingValues, getEchartsValues, getMenuValues, getSubmenuNumberValues } from '@backend/lib/splitValues';

describe('getMenuValues', () => {
    it('should split the string and return the correct values', () => {
        expect(getMenuValues('menu:cbData:menuToHandle:val')).to.deep.equal({
            cbData: 'cbData',
            menuToHandle: 'menuToHandle',
            val: 'val',
        });
    });

    it('should split the string and return undefined', () => {
        expect(getMenuValues('menu')).to.deep.equal({
            cbData: undefined,
            menuToHandle: undefined,
            val: undefined,
        });
    });
});

describe('getSubMenuNumberValues', () => {
    it('should split the string and return the correct values', () => {
        expect(getSubmenuNumberValues('menu:cbData:device:1255.66')).to.deep.equal({
            callbackData: 'cbData',
            device: 'device',
            value: 1255.66,
        });
    });

    it('should split the string and return undefined', () => {
        expect(getSubmenuNumberValues('menu')).to.deep.equal({
            callbackData: undefined,
            device: undefined,
            value: NaN,
        });
    });
});

describe('getBindingValues', () => {
    it('should split the string and return the correct values', () => {
        expect(getBindingValues('binding:value')).to.deep.equal({
            key: 'binding',
            id: 'value',
        });
    });

    it('should split the string and return the correct key and undefined id', () => {
        expect(getBindingValues('binding')).to.deep.equal({
            key: 'binding',
            id: undefined,
        });
    });
});

describe('getEchartsValues', () => {
    it('should combine string', () => {
        expect(getEchartsValues('binding.value.test')).to.be.equal('binding.value');
    });

    it('should return undefined because cannot combine', () => {
        expect(getEchartsValues('binding')).to.be.undefined;
    });
});
