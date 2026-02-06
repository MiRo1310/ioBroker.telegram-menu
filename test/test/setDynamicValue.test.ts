import { _getDynamicValueIfIsIn } from '@b/app/setstate';
import { utils } from '@iobroker/testing';
import type { Adapter } from '@b/types/types';
import { expect } from 'chai';

const { adapter } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('setDynamicValue', () => {
    it('should process dynamic value setting correctly for empty string', async () => {
        const value = await _getDynamicValueIfIsIn(mockAdapter, '');
        expect(value).to.equal('');
    });

    it('should return propValue if the id isn´t found', async () => {
        const value = await _getDynamicValueIfIsIn(mockAdapter, '{id:test}');
        expect(value).to.equal('');
    });

    it('should replace id with value', async () => {
        await mockAdapter.setForeignStateAsync('test', 122, true);
        const value = await _getDynamicValueIfIsIn(mockAdapter, '{id:test}');
        expect(value).to.equal('122');
    });

    it('should replace id with value, with text before', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _getDynamicValueIfIsIn(mockAdapter, 'Test {id:test}');
        expect(value).to.equal('Test 122');
    });

    it('should replace id with value, with math', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _getDynamicValueIfIsIn(mockAdapter, '{id:test} {math:+1}');
        expect(value).to.equal('123');
    });

    it('should replace id with value, with math, text before and after, without placeholder', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _getDynamicValueIfIsIn(mockAdapter, 'xx {id:test} {math:+1} xx');
        expect(value).to.equal('xx xx 123');
    });

    it('should replace id with value, with math, text before and after', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _getDynamicValueIfIsIn(mockAdapter, 'xx && xx {id:test} {math:+1}');
        expect(value).to.equal('xx 123 xx');
    });

    it('should replace id with value, with math, text before and after', async () => {
        await mockAdapter.setForeignStateAsync('test', '122', true);
        const value = await _getDynamicValueIfIsIn(
            mockAdapter,
            'xx && xx {id:test} {math:+1} change{"123":"an", "false":"aus"}',
        );
        expect(value).to.equal('xx an xx');
    });
});
