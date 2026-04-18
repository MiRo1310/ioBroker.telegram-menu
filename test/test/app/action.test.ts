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

describe('action', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            log: {
                debug: sinon.stub(),
                warn: sinon.stub(),
                error: sinon.stub(),
            },
            getForeignStateAsync: sinon.stub(),
        };
    });

    // ─── adjustValueType ────────────────────────────────────────────────────────

    describe('bindingFunc', () => {
        it('should call sendTo after evaluating binding expression', async () => {
            adapterMock.getForeignStateAsync.withArgs('state.0.temp').resolves({ val: 21 });
            adapterMock.sendTo = sinon.stub();

            const telegramParams = {
                adapter: adapterMock,
                telegramInstanceList: [{ name: 'telegram.0', active: true }],
                userListWithChatID: [{ name: 'Michael', chatID: '123' }],
                resize_keyboard: false,
                one_time_keyboard: false,
            } as any;

            const text = '{binding:temp=state.0.temp?temp>20}';
            await bindingFunc(adapterMock, 'telegram.0', text, 'Michael', telegramParams, false);
            expect(adapterMock.sendTo.calledOnce).to.be.true;
        });

        it('should not throw if getForeignStateAsync returns null', async () => {
            adapterMock.getForeignStateAsync.resolves(null);
            adapterMock.sendTo = sinon.stub();

            const telegramParams = {
                adapter: adapterMock,
                telegramInstanceList: [{ name: 'telegram.0', active: true }],
                userListWithChatID: [{ name: 'Michael', chatID: '123' }],
                resize_keyboard: false,
                one_time_keyboard: false,
            } as any;

            const text = '{binding:temp=state.0.temp?temp>20}';
            await expect(bindingFunc(adapterMock, 'telegram.0', text, 'Michael', telegramParams, false)).to.not.be.rejected;
        });
    });

    // ─── adjustValueType ────────────────────────────────────────────────────────

    describe('adjustValueType', () => {
        it('should return a parsed number when valueType is number', () => {
            const result = adjustValueType(adapterMock, '42', 'number');
            expect(result).to.equal(42);
        });

        it('should return a parsed decimal number when valueType is number', () => {
            const result = adjustValueType(adapterMock, '3.14', 'number');
            expect(result).to.equal(3.14);
        });

        it('should return false and log error when valueType is number but value is not numeric', () => {
            const result = adjustValueType(adapterMock, 'abc', 'number');
            expect(result).to.equal(false);
            expect(adapterMock.log.error.calledOnce).to.be.true;
        });

        it('should return true when valueType is boolean and value is "true"', () => {
            const result = adjustValueType(adapterMock, 'true', 'boolean');
            expect(result).to.equal(true);
        });

        it('should return false when valueType is boolean and value is "false"', () => {
            const result = adjustValueType(adapterMock, 'false', 'boolean');
            expect(result).to.equal(false);
        });

        it('should return the value as-is when valueType is string', () => {
            const result = adjustValueType(adapterMock, 'hello', 'string');
            expect(result).to.equal('hello');
        });

        it('should return the value as-is for unknown valueType', () => {
            const result = adjustValueType(adapterMock, 'someValue', 'unknown');
            expect(result).to.equal('someValue');
        });
    });

    // ─── getUserToSendFromUserListWithChatID ─────────────────────────────────────

    describe('getUserToSendFromUserListWithChatID', () => {
        const userList: UserListWithChatID[] = [
            { chatID: '111', name: 'Alice' } as UserListWithChatID,
            { chatID: '222', name: 'Bob' } as UserListWithChatID,
            { chatID: '333', name: 'Charlie' } as UserListWithChatID,
        ];

        it('should return the correct user for a matching chatID', () => {
            const result = getUserToSendFromUserListWithChatID(userList, '222');
            expect(result).to.deep.equal({ chatID: '222', name: 'Bob' });
        });

        it('should return undefined for a non-existing chatID', () => {
            const result = getUserToSendFromUserListWithChatID(userList, '999');
            expect(result).to.be.undefined;
        });

        it('should return the first matching user', () => {
            const result = getUserToSendFromUserListWithChatID(userList, '111');
            expect(result?.chatID).to.equal('111');
        });

        it('should return undefined for an empty list', () => {
            const result = getUserToSendFromUserListWithChatID([], '111');
            expect(result).to.be.undefined;
        });
    });

    // ─── generateActions ─────────────────────────────────────────────────────────

    describe('generateActions', () => {
        it('should return undefined if action is undefined', () => {
            const userObject: NewObjectStructure = {};
            const result = generateActions({ action: undefined, userObject, adapter: adapterMock });
            expect(result).to.not.be.undefined;
            expect(result?.ids).to.deep.equal([]);
        });

        it('should generate switch actions with correct structure', () => {
            const userObject: NewObjectStructure = {};
            const action: Actions = {
                set: [
                    {
                        trigger: ['btn1'],
                        IDs: ['state.0.light'],
                        values: ['true'],
                        switch_checkbox: ['true'],
                        confirm: ['false'],
                        returnText: ['Done'],
                        ack: ['false'],
                        parse_mode: ['false'],
                    },
                ],
                get: [],
                pic: [],
                httpRequest: [],
                echarts: [],
                events: [],
            };

            const result = generateActions({ action, userObject, adapter: adapterMock });

            expect(result).to.not.be.undefined;
            expect(result?.ids).to.include('state.0.light');
            expect(userObject['btn1']?.switch).to.be.an('array').with.lengthOf(1);
            expect(userObject['btn1']?.switch?.[0]?.id).to.equal('state.0.light');
            expect(userObject['btn1']?.switch?.[0]?.value).to.equal('true');
            expect(userObject['btn1']?.switch?.[0]?.toggle).to.equal(true);
            expect(userObject['btn1']?.switch?.[0]?.confirm).to.equal(false);
            expect(userObject['btn1']?.switch?.[0]?.ack).to.equal(false);
        });

        it('should collect all IDs from multiple set actions', () => {
            const userObject: NewObjectStructure = {};
            const action: Actions = {
                set: [
                    {
                        trigger: ['btn1'],
                        IDs: ['state.0.light', 'state.0.fan'],
                        values: ['true', 'false'],
                        switch_checkbox: ['false', 'true'],
                        confirm: ['false', 'false'],
                        returnText: ['', ''],
                        ack: ['false', 'false'],
                        parse_mode: ['false'],
                    },
                ],
                get: [],
                pic: [],
                httpRequest: [],
                echarts: [],
                events: [],
            };

            const result = generateActions({ action, userObject, adapter: adapterMock });

            expect(result?.ids).to.include('state.0.light');
            expect(result?.ids).to.include('state.0.fan');
        });

        it('should generate getData actions from get entries', () => {
            const userObject: NewObjectStructure = {};
            const action: Actions = {
                set: [],
                get: [
                    {
                        trigger: ['btnGet'],
                        IDs: ['state.0.temp'],
                        text: ['Temperature:'],
                        newline_checkbox: ['true'],
                        parse_mode: ['false'],
                    },
                ],
                pic: [],
                httpRequest: [],
                echarts: [],
                events: [],
            };

            const result = generateActions({ action, userObject, adapter: adapterMock });

            expect(result).to.not.be.undefined;
            const getData = userObject['btnGet']?.getData as any[];
            expect(getData).to.be.an('array').with.lengthOf(1);
            expect(getData[0].id).to.equal('state.0.temp');
            expect(getData[0].text).to.equal('Temperature:');
        });

        it('should generate sendPic actions from pic entries', () => {
            const userObject: NewObjectStructure = {};
            const action: Actions = {
                set: [],
                get: [],
                pic: [
                    {
                        trigger: ['btnPic'],
                        IDs: ['cam.0.snapshot'],
                        fileName: ['photo.jpg'],
                        picSendDelay: ['500'],
                    },
                ],
                httpRequest: [],
                echarts: [],
                events: [],
            };

            const result = generateActions({ action, userObject, adapter: adapterMock });
            console.log(result?.obj.btnPic.sendPic);
            expect(result).to.not.be.undefined;
            const sendPic = userObject['btnPic']?.sendPic as any[];
            expect(sendPic).to.be.an('array').with.lengthOf(1);
            expect(sendPic[0].id).to.equal('cam.0.snapshot');
            expect(sendPic[0].fileName).to.equal('photo.jpg');
            expect(sendPic[0].delay).to.equal('500');
        });

        it('should generate httpRequest actions from httpRequest entries', () => {
            const userObject: NewObjectStructure = {};
            const action: Actions = {
                set: [],
                get: [],
                pic: [],
                httpRequest: [
                    {
                        trigger: ['btnHttp'],
                        url: ['https://example.com'],
                        user: ['admin'],
                        password: ['secret'],
                        filename: ['result.json'],
                        delay: ['0'],
                    },
                ],
                echarts: [],
                events: [],
            };

            const result = generateActions({ action, userObject, adapter: adapterMock });

            expect(result).to.not.be.undefined;
            const httpRequest = userObject['btnHttp']?.httpRequest as any[];
            expect(httpRequest).to.be.an('array').with.lengthOf(1);
            expect(httpRequest[0].url).to.equal('https://example.com');
            expect(httpRequest[0].user).to.equal('admin');
            expect(httpRequest[0].password).to.equal('secret');
        });

        it('should replace &amp; with & in string values', () => {
            const userObject: NewObjectStructure = {};
            const action: Actions = {
                set: [],
                get: [],
                pic: [],
                httpRequest: [
                    {
                        trigger: ['btnHttp'],
                        url: ['https://example.com?a=1&amp;b=2'],
                        user: [''],
                        password: [''],
                        filename: [''],
                        delay: ['0'],
                    },
                ],
                echarts: [],
                events: [],
            };

            generateActions({ action, userObject, adapter: adapterMock });

            const httpRequest = userObject['btnHttp']?.httpRequest as any[];
            expect(httpRequest[0].url).to.equal('https://example.com?a=1&b=2');
        });

        it('should skip actions without a trigger', () => {
            const userObject: NewObjectStructure = {};
            const action: Actions = {
                set: [],
                get: [
                    {
                        trigger: [],
                        IDs: ['state.0.temp'],
                        text: ['Temp'],
                        newline_checkbox: ['false'],
                        parse_mode: ['false'],
                    },
                ],
                pic: [],
                httpRequest: [],
                echarts: [],
                events: [],
            };

            const result = generateActions({ action, userObject, adapter: adapterMock });
            expect(result).to.not.be.undefined;
            expect(Object.keys(userObject)).to.have.lengthOf(0);
        });
    });
});
