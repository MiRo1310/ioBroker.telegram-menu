import { expect } from 'chai';
import sinon from 'sinon';
import { SetStateListenerHandler } from '@backend/app/setStateListenerHandler';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';
import type { SetStateIds } from '@backend/types/types';

describe('SetStateListenerHandler', () => {
    let adapterMock: any;
    let appContext: AppContext;
    let handler: SetStateListenerHandler;
    let sendToTelegramStub: sinon.SinonStub;

    const makeEl = (overrides: Partial<SetStateIds> = {}): SetStateIds => ({
        id: 'test.0.state',
        userToSend: 'Alice',
        confirm: true,
        returnText: 'Value set',
        parse_mode: false,
        instance: 'telegram.0',
        ...overrides,
    });

    const makeState = (val: any, ack: boolean): ioBroker.State => ({
        val,
        ack,
        ts: Date.now(),
        lc: Date.now(),
        from: 'test',
        q: 0,
    });

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
        };
        appContext = createAppContextMock(adapterMock);
        handler = new SetStateListenerHandler(appContext);
        sendToTelegramStub = sinon.stub(require('../../../src/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(() => {
        sinon.restore();
    });

    // ─── entry conditions ────────────────────────────────────────────────────

    describe('entry conditions', () => {
        it('should do nothing when state is null', async () => {
            const list: SetStateIds[] = [makeEl()];
            await handler.handleSetStateListener(null, list, 'test.0.state');
            expect(sendToTelegramStub.called).to.be.false;
        });

        it('should do nothing when state is undefined', async () => {
            const list: SetStateIds[] = [makeEl()];
            await handler.handleSetStateListener(undefined, list, 'test.0.state');
            expect(sendToTelegramStub.called).to.be.false;
        });

        it('should do nothing when id is not in list', async () => {
            const list: SetStateIds[] = [makeEl({ id: 'other.id' })];
            await handler.handleSetStateListener(makeState(42, true), list, 'test.0.state');
            expect(sendToTelegramStub.called).to.be.false;
        });

        it('should do nothing when confirm=false and ack=false', async () => {
            const list: SetStateIds[] = [makeEl({ confirm: false })];
            await handler.handleSetStateListener(makeState(42, false), list, 'test.0.state');
            expect(sendToTelegramStub.called).to.be.false;
        });

        it('should do nothing when confirm=false and ack=true', async () => {
            const list: SetStateIds[] = [makeEl({ confirm: false })];
            await handler.handleSetStateListener(makeState(42, true), list, 'test.0.state');
            expect(sendToTelegramStub.called).to.be.false;
            expect(list).to.have.lengthOf(1);
        });
    });

    // ─── handlePreConfirm ────────────────────────────────────────────────────
    // Fires when: isTruthy(confirm) && !ack && returnText includes '{confirmSet:'

    describe('handlePreConfirm path', () => {
        it('should send text with state value substituted via && placeholder', async () => {
            // '&&' in splitSubstring[1] is the placeholder replaced by state.val
            const list: SetStateIds[] = [makeEl({
                confirm: true,
                returnText: '{confirmSet:New value: &&:}',
            })];
            await handler.handleSetStateListener(makeState('on', false), list, 'test.0.state');
            expect(sendToTelegramStub.calledOnce).to.be.true;
            const { textToSend, userToSend, instance } = sendToTelegramStub.firstCall.args[0];
            expect(textToSend).to.include('on');
            expect(userToSend).to.equal('Alice');
            expect(instance).to.equal('telegram.0');
        });

        it('should send static text when noValue is set', async () => {
            // splitSubstring[2] includes 'noValue' → sends splitSubstring[1] as-is
            const list: SetStateIds[] = [makeEl({
                confirm: true,
                returnText: '{confirmSet:Confirmed:noValue}',
            })];
            await handler.handleSetStateListener(makeState('on', false), list, 'test.0.state');
            expect(sendToTelegramStub.calledOnce).to.be.true;
            expect(sendToTelegramStub.firstCall.args[0].textToSend).to.equal('Confirmed');
        });

        it('should log error when state.val is undefined', async () => {
            // isDefined(undefined) = false → text stays '' → log.error
            const list: SetStateIds[] = [makeEl({
                confirm: true,
                returnText: '{confirmSet:&&:}',
            })];
            await handler.handleSetStateListener(makeState(undefined, false), list, 'test.0.state');
            expect(adapterMock.log.error.calledOnce).to.be.true;
        });

        it('should not splice entry from list (stays for postConfirm later)', async () => {
            const list: SetStateIds[] = [makeEl({
                confirm: true,
                returnText: '{confirmSet:Confirm:noValue}',
            })];
            await handler.handleSetStateListener(makeState('on', false), list, 'test.0.state');
            expect(sendToTelegramStub.callCount).to.equal(1);
            expect(list).to.have.lengthOf(1);
        });

        it('should skip preConfirm when returnText has no {confirmSet: (falls to postConfirm check)', async () => {
            // confirm=true, ack=false, no {confirmSet: → preConfirm returns false, postConfirm skips (ack=false)
            const list: SetStateIds[] = [makeEl({ confirm: true, returnText: 'Done' })];
            await handler.handleSetStateListener(makeState(42, false), list, 'test.0.state');
            expect(sendToTelegramStub.called).to.be.false;
        });
    });

    // ─── handlePostConfirm ───────────────────────────────────────────────────
    // Fires when: !isFalsy(confirm) && ack=true

    describe('handlePostConfirm path', () => {
        it('should send text and splice entry from list', async () => {
            const list: SetStateIds[] = [makeEl({ confirm: true, returnText: 'Done' })];
            await handler.handleSetStateListener(makeState(42, true), list, 'test.0.state');
            expect(sendToTelegramStub.calledOnce).to.be.true;
            expect(list).to.have.lengthOf(0);
        });

        it('should send to correct user and instance', async () => {
            const list: SetStateIds[] = [makeEl({ confirm: true, returnText: 'Done', userToSend: 'Bob', instance: 'telegram.1' })];
            await handler.handleSetStateListener(makeState(42, true), list, 'test.0.state');
            const { userToSend, instance } = sendToTelegramStub.firstCall.args[0];
            expect(userToSend).to.equal('Bob');
            expect(instance).to.equal('telegram.1');
        });

        it('should strip {confirmSet:...} from returnText before sending', async () => {
            const list: SetStateIds[] = [makeEl({
                confirm: true,
                returnText: 'Done {confirmSet:Pending:noValue}',
            })];
            await handler.handleSetStateListener(makeState(42, true), list, 'test.0.state');
            const { textToSend } = sendToTelegramStub.firstCall.args[0];
            expect(textToSend).to.not.include('{confirmSet:');
            expect(textToSend).to.include('Done');
        });

        it('should extract confirmText from {setDynamicValue:...}', async () => {
            const list: SetStateIds[] = [makeEl({
                confirm: true,
                returnText: '{setDynamicValue:id:key:ConfirmMsg}',
            })];
            await handler.handleSetStateListener(makeState(42, true), list, 'test.0.state');
            const { textToSend } = sendToTelegramStub.firstCall.args[0];
            expect(textToSend).to.include('ConfirmMsg');
        });

        it('should only process matching id and leave others untouched', async () => {
            const list: SetStateIds[] = [
                makeEl({ id: 'other.id', returnText: 'Other' }),
                makeEl({ returnText: 'Matched' }),
            ];
            await handler.handleSetStateListener(makeState(42, true), list, 'test.0.state');
            expect(sendToTelegramStub.calledOnce).to.be.true;
            expect(list).to.have.lengthOf(1);
            expect(list[0].id).to.equal('other.id');
        });

    });
});
