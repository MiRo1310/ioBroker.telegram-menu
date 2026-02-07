import { expect } from 'chai';

import { utils } from '@iobroker/testing';
import type { Adapter, Part, TelegramParams } from '@b/types/types';
import { handleSetState } from '@b/app/setstate';

const { adapter, database } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

database.publishState('test.0.test', { val: '0', ack: true });
const telegramParams: TelegramParams = {
    adapter: mockAdapter,
    telegramInstanceList: [{ name: 'telegram.0', active: true }],
    one_time_keyboard: true,
    resize_keyboard: true,
    userListWithChatID: [{ name: 'Michael', chatID: '999', instance: 'telegram.0' }],
};

describe('Setstate', () => {
    it('should return correct value with foreignId object', async () => {
        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText: '{"foreignId":"test.0.test","text":"Der Wert wurde auf && °C gesetzt"}',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('Der Wert wurde auf 0 °C gesetzt');
    });

    it('should return correct value with foreignId object and change', async () => {
        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText:
                        '{"foreignId":"test.0.test","text":"Warmwasser neuer Zustand ist:"} && change{"0":"EIN","1":"AUS","2":"AUTO"}',
                },
            ],
        } as Part;

        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('Warmwasser neuer Zustand ist: EIN');
    });

    it('should return correct value with foreignId object and change, without &&', async () => {
        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText:
                        '{"foreignId":"test.0.test","text":"Warmwasser neuer Zustand ist:"} change{"0":"EIN","1":"AUS","2":"AUTO"}',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('Warmwasser neuer Zustand ist: EIN');
    });

    it('should return correct value with id object with &&', async () => {
        mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText: "ReturnText: && {id:'test.0.test'}",
                    value: 'setValue',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('ReturnText: setValue stateValue');
    });

    it('should return correct value with id object without && ', async () => {
        mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText: "ReturnText:  {id:'test.0.test'}",
                    value: 'setValue',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('ReturnText: setValue stateValue');
    });

    it('should return correct value with id object without && but with change ', async () => {
        mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText:
                        "ReturnText:  {id:'test.0.test'}   change{'setValue':'EIN','1':'AUS','2':'AUTO'} change{'set':'EIN','stateValue':'AUS','2':'AUTO'}",
                    value: 'setValue',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('ReturnText: EIN AUS');
    });

    it('should return correct value with id object without && but with novalue from setState ', async () => {
        mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText: "ReturnText:  {id:'test.0.test'}  {novalue} ",
                    value: 'setValue',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('ReturnText: stateValue');
    });

    it.only('should return correct value with id object without && and change and no value from setState ', async () => {
        mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText:
                        "ReturnText:  {id:'test.0.test'}  {novalue} change{'s':'EIN','s':'AUS','2':'AUTO'} change{'set':'EIN','stateValue':'AUS','2':'AUTO'}",
                    value: 'setValue',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

        expect(result?.instance).to.deep.equal('telegram.0');
        expect(result?.textToSend).to.deep.equal('ReturnText: AUS');
    });
});
