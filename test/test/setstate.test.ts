import { expect } from 'chai';
import sinon from 'sinon';

import { utils } from '@iobroker/testing';
import type { Adapter, Part } from '@backend/types/types';
import { handleSetState, setstateIobroker } from '@backend/app/setstate';
import { createAppContextMock } from '../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

const { adapter, database } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

database.publishState('test.0.test', { val: '0', ack: true });

describe('Setstate', () => {
    let appContext: AppContext;

    beforeEach(() => {
        appContext = createAppContextMock(mockAdapter);
    });

    it('should NOT send immediately for foreignId — registers listener instead', async () => {
        const part = {
            switch: [
                {
                    id: 'test.0',
                    confirm: true,
                    returnText: '{"foreignId":"test.0.test","text":"Der Wert wurde auf && °C gesetzt"}',
                },
            ],
        } as Part;
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

        expect(result).to.be.undefined;
        const list = appContext.stateIdRegistry.getIds();
        expect(list.some(el => el.id === 'test.0.test' && el.returnText === 'Der Wert wurde auf && °C gesetzt')).to.be
            .true;
    });

    it('should NOT send immediately for foreignId with change', async () => {
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

        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

        expect(result).to.be.undefined;
        const list = appContext.stateIdRegistry.getIds();
        expect(list.some(el => el.id === 'test.0.test')).to.be.true;
    });

    it('should NOT send immediately for foreignId with change, without &&', async () => {
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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

        expect(result).to.be.undefined;
        const list = appContext.stateIdRegistry.getIds();
        expect(list.some(el => el.id === 'test.0.test')).to.be.true;
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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);
        expect(result?.textToSend).to.include('false');
    });

    it('should return undefined if part has no switch', async () => {
        const part = {} as Part;
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);
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

            const countBefore = appContext.stateIdRegistry.getIds().length;
            await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

            const listAfter = appContext.stateIdRegistry.getIds();
            expect(listAfter.some(el => el.id === testId)).to.be.false;
            expect(listAfter.length).to.equal(countBefore);
        });

        it('should NOT add the state ID to the listener list when confirm=false (no feedback needed)', async () => {
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

            const countBefore = appContext.stateIdRegistry.getIds().length;
            await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

            const listAfter = appContext.stateIdRegistry.getIds();
            expect(listAfter.some(el => el.id === testId)).to.be.false;
            expect(listAfter.length).to.equal(countBefore);
        });
    });

    describe('SetDynamicValue + confirm=true + ack=true — kein Doppel-Send', () => {
        it('should NOT register listener for idToSet when setDynamicValue, confirm=true and no watchForId (prevents double send with ack=true)', async () => {
            const testId = 'test.0.setdynamic-double-send-ack';
            await mockAdapter.setForeignStateAsync(testId, '0', true);

            const part = {
                switch: [
                    {
                        id: testId,
                        confirm: true,
                        returnText: '{setDynamicValue:Frage:string:Antwort}',
                        value: '',
                        ack: true,
                        toggle: false,
                        parse_mode: false,
                    },
                ],
            } as Part;

            await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

            const listAfter = appContext.stateIdRegistry.getIds();
            expect(listAfter.some(el => el.id === testId && el.confirm === true)).to.be.false;
        });

        it('SHOULD still register listener for watchForId when setDynamicValue has watchForId set', async () => {
            const testId = 'test.0.setdynamic-watchforid-trigger';
            const watchId = 'test.0.setdynamic-watchforid-watch';
            await mockAdapter.setForeignStateAsync(testId, '0', true);
            await mockAdapter.setForeignStateAsync(watchId, '0', true);

            const part = {
                switch: [
                    {
                        id: testId,
                        confirm: true,
                        returnText: `{setDynamicValue:Frage:string:Antwort:${watchId}}`,
                        value: '',
                        ack: true,
                        toggle: false,
                        parse_mode: false,
                    },
                ],
            } as Part;

            await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

            const listAfter = appContext.stateIdRegistry.getIds();
            expect(listAfter.some(el => el.id === watchId && el.confirm === true)).to.be.true;
        });
    });

    describe('Double-send bug: useForeignId=true + confirm=true sendet zweimal', () => {
        afterEach(() => sinon.restore());

        it('should NOT call sendToTelegram immediately when useForeignId=true (only listener should send)', async () => {
            const telegramSpy = sinon.spy(require('../../src/app/telegram'), 'sendToTelegram');

            database.publishState('test.0.double-send-foreign', { val: '5', ack: true });

            const part = {
                switch: [
                    {
                        id: 'test.0',
                        confirm: true,
                        returnText: '{"foreignId":"test.0.double-send-foreign","text":"Wert ist: &&"}',
                        value: '10',
                        ack: false,
                        parse_mode: false,
                        toggle: false,
                    },
                ],
            } as Part;

            await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

            expect(telegramSpy.callCount).to.equal(0);
        });

        it('should register listener for foreignId so it sends when state is acknowledged', async () => {
            sinon.stub(require('../../src/app/telegram'), 'sendToTelegram').resolves();

            database.publishState('test.0.double-send-foreign-listener', { val: '5', ack: true });

            const part = {
                switch: [
                    {
                        id: 'test.0',
                        confirm: true,
                        returnText: '{"foreignId":"test.0.double-send-foreign-listener","text":"Wert ist: &&"}',
                        value: '10',
                        ack: false,
                        parse_mode: false,
                        toggle: false,
                    },
                ],
            } as Part;

            await handleSetState(appContext, 'telegram.0', part, 'Michael', null);

            const listAfter = appContext.stateIdRegistry.getIds();
            expect(listAfter.some(el => el.id === 'test.0.double-send-foreign-listener' && el.confirm === true)).to.be
                .true;
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
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);
        expect(result).to.be.undefined;
    });

    it('should use false when toggle state is null (line 207 false branch)', async () => {
        const part = {
            switch: [
                {
                    id: 'test.0.not-published',
                    toggle: true,
                    confirm: true,
                    returnText: 'Toggled: &&',
                    value: '',
                    ack: false,
                    parse_mode: false,
                },
            ],
        } as Part;
        const result = await handleSetState(appContext, 'telegram.0', part, 'Michael', null);
        expect(result?.textToSend).to.include('false');
    });

    it('should keep valueToTelegram unchanged when useForeignId state is null (line 220 false branch)', async () => {
        const localAdapter = {
            log: { debug: sinon.stub(), error: sinon.stub(), warn: sinon.stub() },
            getForeignStateAsync: sinon.stub().resolves(null),
            setForeignStateAsync: sinon.stub().resolves(),
            getForeignObjectAsync: sinon.stub().resolves({ common: { type: 'string' } }),
            supportsFeature: sinon.stub().returns(false),
            subscribeForeignStates: sinon.stub().resolves(),
            subscribeForeignStatesAsync: sinon.stub().resolves(),
        };
        const part = {
            switch: [
                {
                    id: 'some.state',
                    toggle: false,
                    confirm: false,
                    ack: false,
                    returnText: '{"foreignId":"some.foreign.id","text":"value: &&"}',
                    value: 'newVal',
                    parse_mode: false,
                },
            ],
        } as Part;
        const result = await handleSetState(
            createAppContextMock(localAdapter as any),
            'telegram.0',
            part,
            'user',
            null,
        );
        expect(result).to.be.undefined;
    });

    it('should propagate error from setstateIobroker when setForeignStateAsync throws', async () => {
        const errorAdapter = {
            log: { debug: sinon.stub(), error: sinon.stub() },
            getForeignObjectAsync: sinon.stub().resolves({ common: { type: 'string' } }),
            setForeignStateAsync: sinon.stub().rejects(new Error('set failed')),
            supportsFeature: sinon.stub().returns(false),
        };
        let thrown = false;
        try {
            await setstateIobroker({
                appContext: createAppContextMock(errorAdapter as any),
                id: 'test.state',
                value: 'val',
                ack: false,
            });
        } catch (e: any) {
            thrown = true;
            expect(e.message).to.equal('set failed');
        }
        expect(thrown).to.be.true;
    });

    it('should propagate error when getForeignStateAsync throws during toggle', async () => {
        const errorAdapter = {
            log: { debug: sinon.stub(), error: sinon.stub() },
            getForeignStateAsync: sinon.stub().rejects(new Error('get failed')),
            setForeignStateAsync: sinon.stub().resolves(),
            getForeignObjectAsync: sinon.stub().resolves({ common: { type: 'string' } }),
            supportsFeature: sinon.stub().returns(false),
            subscribeForeignStates: sinon.stub().resolves(),
            subscribeForeignStatesAsync: sinon.stub().resolves(),
        };
        const part = {
            switch: [
                {
                    id: 'toggle.state',
                    toggle: true,
                    confirm: false,
                    ack: false,
                    returnText: '',
                    value: '',
                    parse_mode: false,
                },
            ],
        } as Part;
        await expect(
            handleSetState(createAppContextMock(errorAdapter as any), 'telegram.0', part, 'user', null),
        ).to.be.rejectedWith('get failed');
    });
});
