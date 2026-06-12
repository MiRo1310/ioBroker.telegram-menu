import { expect } from 'chai';
import sinon from 'sinon';
import { handleSetState } from '@backend/app/setstate';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';
import type { Part, SetStateIds, Switch } from '@backend/types/types';

describe('handleSetState', () => {
    let adapterMock: any;
    let appContext: AppContext;
    let sendToTelegramStub: sinon.SinonStub;

    const makeSwitch = (overrides: Partial<Switch> = {}): Switch => ({
        id: 'test.0.switch',
        value: 'on',
        toggle: false,
        confirm: false,
        returnText: 'Done',
        parse_mode: false,
        ack: false,
        ...overrides,
    });

    const makePart = (switchOverride?: Partial<Switch>): Part => ({
        switch: [makeSwitch(switchOverride)],
    });

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            setForeignStateAsync: sinon.stub().resolves(),
            getForeignObjectAsync: sinon.stub().resolves(null),
            getForeignStateAsync: sinon.stub().resolves({ val: 'current', ack: true, ts: 0, lc: 0, from: '', q: 0 }),
            subscribeForeignStatesAsync: sinon.stub().resolves(),
        };
        appContext = createAppContextMock(adapterMock);
        sendToTelegramStub = sinon.stub(require('../../../src/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    // ─── modifiedValue fallback path ─────────────────────────────────────────
    // Called when value is empty — should use valueFromSubmenu as the value to set

    describe('modifiedValue fallback', () => {
        it('should use valueFromSubmenu when value is empty', async () => {
            const part = makePart({ value: '', confirm: false });
            await handleSetState(appContext, 'telegram.0', part, 'Alice', 'submenuResult');
            expect(adapterMock.setForeignStateAsync.calledOnce).to.be.true;
            const [, val] = adapterMock.setForeignStateAsync.firstCall.args;
            expect(val).to.equal('submenuResult');
        });

        it('should return undefined (no confirm) when using modifiedValue path', async () => {
            const part = makePart({ value: '', confirm: false });
            const result = await handleSetState(appContext, 'telegram.0', part, 'Alice', 'submenuResult');
            expect(result).to.be.undefined;
        });
    });

    // ─── ack=true + confirm=true ─────────────────────────────────────────────
    // State wird mit ack=true gesetzt UND der returnText wird an Telegram geschickt

    describe('ack=true mit returnText', () => {
        it('should set state with ack=true and send returnText to Telegram', async () => {
            // {novalue} verhindert, dass exchangeValue den gesetzten Wert an den Text anhängt
            const part = makePart({ ack: true, confirm: true, value: 'newVal', returnText: 'Wert gesetzt! {novalue}' });
            const result = await handleSetState(appContext, 'telegram.0', part, 'Alice', null);

            expect(adapterMock.setForeignStateAsync.calledOnce).to.be.true;
            const [, , ackArg] = adapterMock.setForeignStateAsync.firstCall.args;
            expect(ackArg).to.be.true;

            expect(sendToTelegramStub.calledOnce).to.be.true;
            expect(result?.textToSend).to.equal('Wert gesetzt!');
        });

        it('should set state with ack=false and NOT send returnText when confirm=false', async () => {
            const part = makePart({ ack: false, confirm: false, value: 'newVal', returnText: 'Wert gesetzt! {novalue}' });
            const result = await handleSetState(appContext, 'telegram.0', part, 'Alice', null);

            expect(adapterMock.setForeignStateAsync.calledOnce).to.be.true;
            const [, , ackArg] = adapterMock.setForeignStateAsync.firstCall.args;
            expect(ackArg).to.be.false;

            expect(sendToTelegramStub.called).to.be.false;
            expect(result).to.be.undefined;
        });
    });

    // ─── Double-Send-Guard ───────────────────────────────────────────────────
    // When confirm=true and ID is already in stateIdRegistry → log.error

    describe('Double-Send-Guard', () => {
        const registryEntry = (): SetStateIds => ({
            id: 'test.0.switch',
            userToSend: 'Alice',
            confirm: true,
            returnText: 'Done',
            parse_mode: false,
            instance: 'telegram.0',
        });

        it('should log error when ID is already registered in stateIdRegistry', async () => {
            await appContext.stateIdRegistry.addIds(adapterMock, registryEntry());

            const part = makePart({ confirm: true, value: 'on' });
            await handleSetState(appContext, 'telegram.0', part, 'Alice', null);

            expect(adapterMock.log.error.calledOnce).to.be.true;
            expect(adapterMock.log.error.firstCall.args[0]).to.include('Double-send detected');
        });

        it('should still send to Telegram even when double-send detected', async () => {
            await appContext.stateIdRegistry.addIds(adapterMock, registryEntry());

            const part = makePart({ confirm: true, value: 'on' });
            await handleSetState(appContext, 'telegram.0', part, 'Alice', null);

            expect(sendToTelegramStub.calledOnce).to.be.true;
        });

        it('should not log error when ID is NOT in stateIdRegistry', async () => {
            const part = makePart({ confirm: true, value: 'on' });
            await handleSetState(appContext, 'telegram.0', part, 'Alice', null);

            expect(adapterMock.log.error.called).to.be.false;
            expect(sendToTelegramStub.calledOnce).to.be.true;
        });
    });
});
