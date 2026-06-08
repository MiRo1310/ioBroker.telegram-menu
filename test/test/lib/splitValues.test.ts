import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
    getBindingValues,
    getEchartsValues,
    getMenuValues,
    getProcessTimeValues,
    getSubmenuNumberValues,
} from '@backend/lib/splitValues';

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

describe('getProcessTimeValues', () => {
    it('should parse typeofTimestamp, timeString and idString from full input', () => {
        const result = getProcessTimeValues("lc,(DD MM YYYY),id:'some.state.id'");
        expect(result.typeofTimestamp).to.equal('lc');
        expect(result.timeString).to.equal('(DD MM YYYY)');
        expect(result.idString).to.equal('some.state.id');
    });

    it('should use empty string for timeString and idString when array has fewer than 3 elements', () => {
        const result = getProcessTimeValues('ts');
        expect(result.typeofTimestamp).to.equal('ts');
        expect(result.timeString).to.equal('');
        expect(result.idString).to.equal('');
    });

    it('should use empty string for idString when only 2 elements', () => {
        const result = getProcessTimeValues('lc,(DD MM YYYY)');
        expect(result.typeofTimestamp).to.equal('lc');
        expect(result.timeString).to.equal('(DD MM YYYY)');
        expect(result.idString).to.equal('');
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
