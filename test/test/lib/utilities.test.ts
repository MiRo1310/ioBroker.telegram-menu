import { expect } from 'chai';
import sinon from 'sinon';
import * as utilities from '../../../src/lib/utilities';
import { invalidId } from '@backend/config/config';
import { changeToNumber } from '@backend/lib/utilities';

describe('utilities', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            getForeignStateAsync: sinon.stub(),
            getForeignObjectAsync: sinon.stub(),
            setForeignStateAsync: sinon.stub(),
            log: {
                debug: sinon.stub(),
                warn: sinon.stub(),
            },
        };
    });

    describe('setTimeValue', () => {
        it('should return invalidId if id is missing', async () => {
            const result = await utilities.getTimeValue(adapterMock, "{time.lc,(DD MM YYYY hh:mm:ss:sss),id:''}");
            expect(result).to.be.equal(invalidId);
        });

        it('should return invalidId if value is missing', async () => {
            adapterMock.getForeignStateAsync.resolves(undefined);
            const result = await utilities.getTimeValue(adapterMock, "{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'12345'}");
            expect(result).to.be.equal(invalidId);
        });

        it('should return formated time lc', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(
                adapterMock,
                "{time.lc,(DD MM YYYY hh:mm:ss:sss),id:'validId'}",
            );
            expect(result).to.be.equal('18 04 2026 07:11:42:372');
        });
        it('should return formated time ts', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(
                adapterMock,
                "{time.ts,(DD MM YYYY hh:mm:ss:sss),id:'validId'}",
            );
            expect(result).to.be.equal('16 04 2026 07:11:42:000');
        });

        it('should return formated time ts, without ms', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,(DD MM YYYY hh:mm:ss:),id:'validId'}");
            expect(result).to.be.equal('16 04 2026 07:11:42:');
        });

        it('should return formated time ts, without day,hour,ms ', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,( MM YYYY mm:ss),id:'validId'}");
            expect(result).to.be.equal('04 2026 11:42');
        });

        it('should return formated time ts, without day,hour,ms and custom text ', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,( MM YYYY mm:ss:test),id:'validId'}");
            expect(result).to.be.equal('04 2026 11:42:test');
        });

        it('should return formated time ts, without day,hour,ms ', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,( MM YYYY mm:ss:),id:'validId'}");
            expect(result).to.be.equal('04 2026 11:42:');
        });

        it('should return formated time ts without s,ms', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,(DD MM YYYY hh:mm),id:'validId'}");
            expect(result).to.be.equal('16 04 2026 07:11');
        });

        it('should return formated time ts without m,s,ms', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,(DD MM YYYY hh),id:'validId'}");
            expect(result).to.be.equal('16 04 2026 07');
        });

        it('should return formated time ts without time', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,(DD MM YYYY),id:'validId'}");
            expect(result).to.be.equal('16 04 2026');
        });

        it('should return formated time ts without year,time', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,(DD MM),id:'validId'}");
            expect(result).to.be.equal('16 04');
        });

        it('should return formated time ts without month,year,time', async () => {
            adapterMock.getForeignStateAsync.resolves({ lc: 1776489102372, ts: 1776316302000 });
            const result = await utilities.getTimeValue(adapterMock, "{time.ts,(DD),id:'validId'}");
            expect(result).to.be.equal('16');
        });
    });

    describe('textModifier', () => {
        it('should return empty string if text is undefined', async () => {
            const result = await utilities.textModifier(adapterMock, undefined);
            expect(result).to.equal('');
        });

        it('should handle text without modification', async () => {
            const result = await utilities.textModifier(adapterMock, 'plain text');
            expect(result).to.equal('plain text');
        });

        it('should handle text with status and change', async () => {
            adapterMock.getForeignStateAsync.resolves({ val: 123 });
            const text = 'Test {status:"ID":true} change{"123":"an","456":"aus"}';
            const result = await utilities.textModifier(adapterMock, text);
            expect(result).to.equal('Test an');
        });

        it('should handle text with status and deactivated change', async () => {
            adapterMock.getForeignStateAsync.resolves({ val: 123 });
            const text = 'Test {status:"telegram.0.test":false} change{"123":"an","456":"aus"}';
            const result = await utilities.textModifier(adapterMock, text);
            expect(result).to.equal('Test 123 change{"123":"an","456":"aus"}');
        });

        it('should handle text with status and deactivated change', async () => {
            adapterMock.getForeignStateAsync.withArgs('telegram.0.test').resolves({ val: 123 });
            const text = 'Test {status:"telegram.0.test":false} change{"123":"an","456":"aus"}';
            const result = await utilities.textModifier(adapterMock, text);
            expect(result).to.equal('Test 123 change{"123":"an","456":"aus"}');
        });

        it('should handle text with status and change and time.ts', async () => {
            adapterMock.getForeignStateAsync.withArgs('test.0.test').resolves({ lc: 1776489102372, ts: 1776316302000 });
            adapterMock.getForeignStateAsync.withArgs('telegram.0.test').resolves({ val: 123 });
            const text =
                'Test {status:"telegram.0.test":true} change{"123":"an","456":"aus"} {time.ts,(DD MM),id:"test.0.test"}';
            const result = await utilities.textModifier(adapterMock, text);
            expect(result).to.equal('Test an 16 04');
        });

        it('should handle text with status ,change ,time.ts and set', async () => {
            adapterMock.getForeignStateAsync.withArgs('test.0.test').resolves({ lc: 1776489102372, ts: 1776316302000 });
            adapterMock.getForeignStateAsync.withArgs('telegram.0.test').resolves({ val: 123 });

            const text =
                'Test {status:"telegram.0.test":true} change{"123":"an","456":"aus"} {time.ts,(DD MM),id:"test.0.test"} {set:\'id\':\'idToSet\',abc,true}';
            const result = await utilities.textModifier(adapterMock, text);
            expect(result).to.equal('Test an 16 04');
            expect(adapterMock.setForeignStateAsync.calledOnceWith('idToSet', 'abc', true)).to.be.true;
        });

        it('should handle text with status ,change ,time.ts and set with ack false', async () => {
            adapterMock.getForeignStateAsync.withArgs('test.0.test').resolves({ lc: 1776489102372, ts: 1776316302000 });
            adapterMock.getForeignStateAsync.withArgs('telegram.0.test').resolves({ val: 123 });

            const text =
                'Test {status:"telegram.0.test":true} change{"123":"an","456":"aus"} {time.ts,(DD MM),id:"test.0.test"} {set:\'id\':\'idToSet\',abc,false}';
            const result = await utilities.textModifier(adapterMock, text);
            expect(result).to.equal('Test an 16 04');
            expect(adapterMock.setForeignStateAsync.calledOnceWith('idToSet', 'abc', false)).to.be.true;
        });

        it('should handle text with status ,change ,time.ts and set with non ack', async () => {
            adapterMock.getForeignStateAsync.withArgs('test.0.test').resolves({ lc: 1776489102372, ts: 1776316302000 });
            adapterMock.getForeignStateAsync.withArgs('telegram.0.test').resolves({ val: 123 });

            const text =
                'Test {status:"telegram.0.test":true} change{"123":"an","456":"aus"} {time.ts,(DD MM),id:"test.0.test"} {set:\'id\':\'idToSet\',abc}';
            const result = await utilities.textModifier(adapterMock, text);
            expect(result).to.equal('Test an 16 04');
            expect(adapterMock.setForeignStateAsync.calledOnceWith('idToSet', 'abc', false)).to.be.true;
        });
    });

    describe('transformValueToTypeOfId', () => {
        it('should return value if object is missing', async () => {
            adapterMock.getForeignObjectAsync.resolves(undefined);
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', 'value');
            expect(result).to.equal('value');
        });

        it('should convert value to string if type is string', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'string' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', 123);
            expect(result).to.equal('123');
        });

        it('should convert value to number if type is number', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'number' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', '42');
            expect(result).to.equal(42);
        });

        it('should convert value to boolean if type is boolean', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'boolean' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', true);
            expect(result).to.equal(true);
        });

        it('should convert value booleanString to boolean', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'boolean' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', 'true');
            expect(result).to.equal(true);
        });

        it('should convert value booleanString to boolean', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'boolean' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', 'false');
            expect(result).to.equal(false);
        });

        it('should return input type if obj.common.type == string | boolean | number', async () => {
            adapterMock.getForeignObjectAsync.resolves({ common: { type: 'object' } });
            const result = await utilities.transformValueToTypeOfId(adapterMock, 'id', 123);
            expect(result).to.equal(123);
        });
    });

    describe('transformValue', () => {
        it('string to number with number', () => {
            expect(changeToNumber(adapterMock, 24.66)).to.be.equal(24.66);
        });

        it('string to number with text number', () => {
            expect(changeToNumber(adapterMock, '42')).to.be.equal(42);
        });

        it('string to number with text decimal', () => {
            expect(changeToNumber(adapterMock, '42.55')).to.be.equal(42.55);
        });

        it('string to number with string number contains , ', () => {
            expect(changeToNumber(adapterMock, '42,55')).to.be.equal(42);
        });

        it('string to number with non string number', () => {
            expect(changeToNumber(adapterMock, 'Invalid')).to.be.undefined;
        });
    });
});
