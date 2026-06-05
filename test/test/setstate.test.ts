import { expect } from 'chai';

import { utils } from '@iobroker/testing';
import type { Adapter, Part } from '@backend/types/types';
import { handleSetState } from '@backend/app/setstate';
import { getStateIdsToListenTo } from '@backend/app/setStateIdsToListenTo';
import { telegramParams } from '../fixtures/telegramParams';

const { adapter, database } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

database.publishState('test.0.test', { val: '0', ack: true });

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
        await mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

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
        await mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

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
        await mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

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
        await mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

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

    it('should return correct value with id object without && and change and no value from setState ', async () => {
        await mockAdapter.setForeignStateAsync('test.0.test', 'stateValue', true);

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

    it('should toggle state value (true -> false)', async () => {
        await mockAdapter.setForeignStateAsync('test.0.toggle', true, true);
        const part = {
            switch: [
                {
                    id: 'test.0.toggle',
                    toggle: true,
                    confirm: true,
                    returnText: 'Toggled: &&',
                    value: '',
                    ack: false,
                    parse_mode: false,
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);
        expect(result?.textToSend).to.include('false');
    });

    it('should return undefined if part has no switch', async () => {
        const part = {} as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);
        expect(result).to.be.undefined;
    });

    describe('Double-send bug: confirm=true darf keine State-ID als Listener registrieren', () => {
        it('should NOT add the state ID to the listener list when confirm=true (prevents double send)', async () => {
            const testId = 'test.0.no-double-send-confirm-true';
            await mockAdapter.setForeignStateAsync(testId, '0', true);

            const part = {
                switch: [
                    {
                        id: testId,
                        confirm: true,
                        returnText: 'State gesetzt: &&',
                        value: '42',
                        toggle: false,
                        ack: false,
                        parse_mode: false,
                    },
                ],
            } as Part;

            const countBefore = getStateIdsToListenTo().length;
            await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

            const listAfter = getStateIdsToListenTo();
            expect(listAfter.some(el => el.id === testId)).to.be.false;
            expect(listAfter.length).to.equal(countBefore);
        });

        it('should ADD the state ID to the listener list when confirm=false', async () => {
            const testId = 'test.0.no-double-send-confirm-false';
            await mockAdapter.setForeignStateAsync(testId, '0', true);

            const part = {
                switch: [
                    {
                        id: testId,
                        confirm: false,
                        returnText: '',
                        value: '42',
                        toggle: false,
                        ack: false,
                        parse_mode: false,
                    },
                ],
            } as Part;

            const countBefore = getStateIdsToListenTo().length;
            await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);

            const listAfter = getStateIdsToListenTo();
            expect(listAfter.some(el => el.id === testId)).to.be.true;
            expect(listAfter.length).to.equal(countBefore + 1);
        });
    });

    it('should handle invalid foreignId JSON gracefully', async () => {
        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText: '{"foreignId":"INVALID JSON broken',
                },
            ],
        } as Part;
        const result = await handleSetState(mockAdapter, 'telegram.0', part, 'Michael', null, telegramParams);
        expect(result).to.be.undefined;
    });
});
