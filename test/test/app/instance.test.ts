import { expect } from 'chai';
import { isInstanceActive } from '../../../src/app/instance';

describe('instance', () => {
    it('should return true if instance is active', () => {
        const list = [{ name: 'telegram.0', active: true }] as any[];
        expect(isInstanceActive(list, 'telegram.0')).to.equal(true);
    });

    it('should return false if instance is not active', () => {
        const list = [{ name: 'telegram.0', active: false }] as any[];
        expect(isInstanceActive(list, 'telegram.0')).to.equal(false);
    });

    it('should return false if instance is not found', () => {
        const list = [{ name: 'telegram.0', active: true }] as any[];
        expect(isInstanceActive(list, 'telegram.1')).to.equal(false);
    });

    it('should return false for empty list', () => {
        expect(isInstanceActive([], 'telegram.0')).to.equal(false);
    });
});

