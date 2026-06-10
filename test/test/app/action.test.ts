import { expect } from 'chai';
import sinon from 'sinon';
import {
    adjustValueType,
    bindingFunc,
    generateActions,
    getUserToSendFromUserListWithChatID,
} from '@backend/app/action';
import type { Actions, NewObjectStructure } from '@backend/types/types';
import type { UserListWithChatID } from '@/types/app';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('action', () => {
    let adapterMock: any;
    let store: AppContext;

    beforeEach(() => {
        adapterMock = {
            log: {
                debug: sinon.stub(),
                warn: sinon.stub(),
                error: sinon.stub(),
            },
            getForeignStateAsync: sinon.stub(),
            sendTo: sinon.stub(),
        };
        store = createAppContextMock(adapterMock, {
            userListWithChatID: [{ name: 'Michael', chatID: '123', instance: 'telegram.0' }],
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        });
    });

    // ─── bindingFunc ────────────────────────────────────────────────────────

    describe('bindingFunc', () => {
        it('should call sendTo after evaluating binding expression', async () => {
            adapterMock.getForeignStateAsync.withArgs('state.0.temp').resolves({ val: 21 });

            const text = '{binding:temp=state.0.temp?temp>20}';
            await bindingFunc(store, 'telegram.0', text, 'Michael', false);
            expect(adapterMock.sendTo.calledOnce).to.be.true;
        });

        it('should not throw if getForeignStateAsync returns null', async () => {
            adapterMock.getForeignStateAsync.resolves(null);

            const text = '{binding:temp=state.0.temp?temp>20}';
            await expect(bindingFunc(store, 'telegram.0', text, 'Michael', false)).to.not.be.rejected;
        });

        it('should populate bindingObject.values and replace key in expression (key:id;?expr format)', async () => {
            adapterMock.getForeignStateAsync.withArgs('state.0.temp').resolves({ val: 25 });

            // Format: binding:{key:stateId;?expression} — key is populated from state, then substituted in expression
            const text = 'binding:{temp:state.0.temp;?temp+0}';
            await bindingFunc(store, 'telegram.0', text, 'Michael', false);
            expect(adapterMock.sendTo.calledOnce).to.be.true;
        });

        it('should use empty string when result.val is null (covers ?? branch)', async () => {
            adapterMock.getForeignStateAsync.withArgs('state.0.temp').resolves({ val: null });

            const text = 'binding:{temp:state.0.temp;?temp+0}';
            await bindingFunc(store, 'telegram.0', text, 'Michael', false);
            expect(adapterMock.sendTo.calledOnce).to.be.true;
        });

        it('should call errorLogger when getForeignStateAsync throws', async () => {
            adapterMock.getForeignStateAsync.rejects(new Error('network error'));

            const text = 'binding:{temp:state.0.temp;?temp+0}';
            await bindingFunc(store, 'telegram.0', text, 'Michael', false);
            expect(adapterMock.log.error.called).to.be.true;
        });
    });

    // ─── adjustValueType ────────────────────────────────────────────────────────

    describe('adjustValueType', () => {
        it('should return a parsed number when valueType is number', () => {
            const result = adjustValueType(adapterMock, '42', 'number');
            expect(result).to.equal(42);
        });

        it('should return a boolean true when valueType is boolean and value is "true"', () => {
            const result = adjustValueType(adapterMock, 'true', 'boolean');
            expect(result).to.equal(true);
        });

        it('should return a boolean false when valueType is boolean and value is "false"', () => {
            const result = adjustValueType(adapterMock, 'false', 'boolean');
            expect(result).to.equal(false);
        });

        it('should return the original string when valueType is string', () => {
            const result = adjustValueType(adapterMock, 'hello', 'string');
            expect(result).to.equal('hello');
        });

        it('should return the original value when valueType is unknown', () => {
            const result = adjustValueType(adapterMock, 'someValue', 'unknown');
            expect(result).to.equal('someValue');
        });

        it('should return false and log error when valueType is number and value is not numeric', () => {
            const result = adjustValueType(adapterMock, 'abc', 'number');
            expect(result).to.be.false;
            expect(adapterMock.log.error.calledOnce).to.be.true;
        });
    });

    // ─── generateActions ────────────────────────────────────────────────────

    describe('generateActions', () => {
        it('should return undefined when action is undefined', () => {
            const userObject: NewObjectStructure = {};
            const result = generateActions({ adapter: adapterMock, action: undefined, userObject });
            expect(result).to.be.undefined;
        });

        it('should return undefined when set is empty and get is empty', () => {
            const action: Actions = {
                get: [],
                set: [],
                pic: [],
                httpRequest: [],
                echarts: [],
                events: [],
            };
            const userObject: NewObjectStructure = {};
            const result = generateActions({ adapter: adapterMock, action, userObject });
            expect(result).to.be.undefined;
        });

        it('should generate set action entries', () => {
            const action: Actions = {
                get: [],
                set: [
                    {
                        IDs: ['state.0.val'],
                        values: ['1'],
                        confirm: ['false'],
                        returnText: ['Done'],
                        ack: ['false'],
                        parse_mode: ['false'],
                        switch_checkbox: ['false'],
                        trigger: ['btn1'],
                    },
                ],
                pic: [],
                httpRequest: [],
                echarts: [],
                events: [],
            };
            const userObject: NewObjectStructure = { btn1: { text: 'Button 1' } };
            const result = generateActions({ adapter: adapterMock, action, userObject });
            expect(result).to.not.be.undefined;
            expect(result?.obj?.btn1?.switch).to.not.be.undefined;
        });
    });

    // ─── getUserToSendFromUserListWithChatID ────────────────────────────────

    describe('getUserToSendFromUserListWithChatID', () => {
        const userList: UserListWithChatID[] = [
            { name: 'Alice', chatID: '123', instance: 'telegram.0' },
            { name: 'Bob', chatID: '456', instance: 'telegram.0' },
        ];

        it('should return the user with matching chatID', () => {
            const result = getUserToSendFromUserListWithChatID(userList, '123');
            expect(result?.name).to.equal('Alice');
        });

        it('should return undefined for non-existent chatID', () => {
            const result = getUserToSendFromUserListWithChatID(userList, '999');
            expect(result).to.be.undefined;
        });
    });
});
