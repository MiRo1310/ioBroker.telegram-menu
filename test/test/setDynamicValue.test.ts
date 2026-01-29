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

    it('should process dynamic value setting correctly for placeholder', async () => {
        const value = await _setDynamicValueIfIsIn(mockAdapter, '{id:test}');
        expect(value).to.equal(undefined);
    });
});
