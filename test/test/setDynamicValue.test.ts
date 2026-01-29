import { _setDynamicValueIfIsIn } from '@b/app/setstate';
import { utils } from '@iobroker/testing';
import type { Adapter } from '@b/types/types';
import { expect } from 'chai';

const { adapter } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('setDynamicValue', () => {
    it('should process dynamic value setting correctly for empty string', async () => {
        const value = await _setDynamicValueIfIsIn(mockAdapter, '');
        expect(value).to.equal('');
    });

    it('should return propValue if the id isn´t found', async () => {
        const value = await _setDynamicValueIfIsIn(mockAdapter, '{id:test}');
        expect(value).to.equal('{id:test}');
    });

    it('should replace id with value', async () => {
        await mockAdapter.setForeignStateAsync('test', 122, true);
        const value = await _setDynamicValueIfIsIn(mockAdapter, '{id:test}');
        expect(value).to.equal('122');
    });

    it('should replace id with value', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _setDynamicValueIfIsIn(mockAdapter, '{id:test}');
        expect(value).to.equal('122');
    });

    it('should replace id with value', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _setDynamicValueIfIsIn(mockAdapter, '{id:test} {math:+1}');
        expect(value).to.equal('123');
    });

    it('should replace id with value', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _setDynamicValueIfIsIn(mockAdapter, 'xx {id:test} {math:+1} xx');
        expect(value).to.equal('xx 123 xx');
    });
});
