import { expect } from 'chai';
import sinon from 'sinon';
import { regexIdText, findDeprecatedAndLog } from '../../../src/app/deprecated';
import type { GeneratedActions } from '@backend/types/types';

describe('deprecated', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            log: { warn: sinon.stub(), debug: sinon.stub() },
        };
    });

    describe('regexIdText', () => {
        it("should match the old {'id':'...','text':'...'} format", () => {
            expect(regexIdText.test("{'id':'adapter.0.test','text':'Hello'}")).to.be.true;
        });

        it("should not match the new format", () => {
            expect(regexIdText.test('{"foreignId":"adapter.0.test","text":"Hello"}')).to.be.false;
        });
    });

    describe('findDeprecatedAndLog', () => {
        it('should not throw if actions is undefined', () => {
            expect(() => findDeprecatedAndLog(adapterMock, undefined)).to.not.throw();
            expect(adapterMock.log.warn.called).to.be.false;
        });

        it('should warn if actions contain old id/text format', () => {
            const actions: GeneratedActions = {
                obj: { "{'id':'adapter.0.test','text':'Hello'}": {} },
                ids: [],
            };
            findDeprecatedAndLog(adapterMock, actions);
            expect(adapterMock.log.warn.calledOnce).to.be.true;
        });

        it('should not warn if actions use new format', () => {
            const actions: GeneratedActions = {
                obj: { '{"foreignId":"adapter.0.test","text":"Hello"}': {} },
                ids: [],
            };
            findDeprecatedAndLog(adapterMock, actions);
            expect(adapterMock.log.warn.called).to.be.false;
        });
    });
});

