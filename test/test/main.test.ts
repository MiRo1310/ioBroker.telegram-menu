import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';

describe('main (TelegramMenu)', () => {
    let TelegramMenu: any;
    let instance: any;

    before(() => {
        // Mock @iobroker/adapter-core so we can instantiate TelegramMenu without ioBroker
        const adapterCoreMock = {
            Adapter: class MockAdapter {
                log = { debug: sinon.stub(), info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };
                on = sinon.stub();
                setState = sinon.stub().resolves();
                getForeignStateAsync = sinon.stub().resolves(null);
                subscribeForeignStatesAsync = sinon.stub().resolves();
                sendTo = sinon.stub();
                clearTimeout = sinon.stub();
                constructor(_opts: any) {
                    // don't call super
                }
            },
            '@noCallThru': true,
            __esModule: true,
        };

        const mod = proxyquire.noCallThru().load(require.resolve('@backend/main'), {
            '@iobroker/adapter-core': adapterCoreMock,
        });
        TelegramMenu = mod.default;

        // Create instance without triggering onReady
        instance = Object.create(TelegramMenu.prototype);
        instance.log = { debug: sinon.stub(), info: sinon.stub(), warn: sinon.stub(), error: sinon.stub() };
        instance.getForeignStateAsync = sinon.stub();
        instance.clearTimeout = sinon.stub();
        instance.supportsFeature = sinon.stub().returns(false);

        // Set the module-level `adapter` export (used by errorLogger and getChatIDAndUserToSend)
        mod.adapter = instance;
    });

    afterEach(() => {
        sinon.resetHistory();
    });

    // ─── isMessageID ────────────────────────────────────────────────────────

    describe('isMessageID', () => {
        it('should return true when id matches botSendMessageID', () => {
            const result = instance['isMessageID']('telegram.0.communicate.botSendMessageId', 'telegram.0.communicate.botSendMessageId', 'telegram.0.communicate.requestMessageId');
            expect(result).to.be.true;
        });

        it('should return true when id matches requestMessageID', () => {
            const result = instance['isMessageID']('telegram.0.communicate.requestMessageId', 'telegram.0.communicate.botSendMessageId', 'telegram.0.communicate.requestMessageId');
            expect(result).to.be.true;
        });

        it('should return false when id matches neither', () => {
            const result = instance['isMessageID']('some.other.id', 'telegram.0.communicate.botSendMessageId', 'telegram.0.communicate.requestMessageId');
            expect(result).to.be.false;
        });
    });

    // ─── isAddToShoppingList ────────────────────────────────────────────────

    describe('isAddToShoppingList', () => {
        it('should return true for alexa-shoppinglist state (not add_position)', () => {
            const result = instance['isAddToShoppingList']('alexa2.0.alexa-shoppinglist.items');
            expect(result).to.be.true;
        });

        it('should return false for add_position state', () => {
            const result = instance['isAddToShoppingList']('alexa2.0.alexa-shoppinglist.add_position');
            expect(result).to.be.false;
        });

        it('should return false for unrelated id', () => {
            const result = instance['isAddToShoppingList']('state.0.temperature');
            expect(result).to.be.false;
        });
    });

    // ─── isMenuToSend ───────────────────────────────────────────────────────

    describe('isMenuToSend', () => {
        it('should return true when all conditions are met', () => {
            const state = { val: '[Alice]page1', ack: true } as any;
            const result = instance['isMenuToSend'](state, 'telegram.0.communicate.request', 'telegram.0.communicate.request', 'Alice');
            expect(result).to.be.true;
        });

        it('should return false when state is null', () => {
            const result = instance['isMenuToSend'](null, 'telegram.0.communicate.request', 'telegram.0.communicate.request', 'Alice');
            expect(result).to.be.false;
        });

        it('should return false when val is empty string', () => {
            const state = { val: '', ack: true } as any;
            const result = instance['isMenuToSend'](state, 'telegram.0.communicate.request', 'telegram.0.communicate.request', 'Alice');
            expect(result).to.be.false;
        });

        it('should return false when id does not match telegramID', () => {
            const state = { val: '[Alice]page1', ack: true } as any;
            const result = instance['isMenuToSend'](state, 'some.other.id', 'telegram.0.communicate.request', 'Alice');
            expect(result).to.be.false;
        });

        it('should return false when ack is false', () => {
            const state = { val: '[Alice]page1', ack: false } as any;
            const result = instance['isMenuToSend'](state, 'telegram.0.communicate.request', 'telegram.0.communicate.request', 'Alice');
            expect(result).to.be.false;
        });

        it('should return false when userToSend is null', () => {
            const state = { val: '[Alice]page1', ack: true } as any;
            const result = instance['isMenuToSend'](state, 'telegram.0.communicate.request', 'telegram.0.communicate.request', null);
            expect(result).to.be.false;
        });

        it('should return false when val is not a string', () => {
            const state = { val: 123, ack: true } as any;
            const result = instance['isMenuToSend'](state, 'telegram.0.communicate.request', 'telegram.0.communicate.request', 'Alice');
            expect(result).to.be.false;
        });
    });

    // ─── getChatIDAndUserToSend ─────────────────────────────────────────────

    describe('getChatIDAndUserToSend', () => {
        it('should return error when chatID state is null', async () => {
            instance.getForeignStateAsync.resolves(null);
            const telegramParams = {
                adapter: instance,
                userListWithChatID: [{ name: 'Alice', chatID: '123' }],
            } as any;
            const result = await instance['getChatIDAndUserToSend'](telegramParams, 'telegram.0');
            expect(result.error).to.be.true;
            expect(result.errorMessage).to.include('ChatId');
        });

        it('should return error when user is not found in list', async () => {
            instance.getForeignStateAsync.resolves({ val: '999' });
            const telegramParams = {
                adapter: instance,
                userListWithChatID: [{ name: 'Alice', chatID: '123' }],
            } as any;
            const result = await instance['getChatIDAndUserToSend'](telegramParams, 'telegram.0');
            expect(result.error).to.be.true;
            expect(result.errorMessage).to.include('User');
        });

        it('should return user when chatID matches', async () => {
            instance.getForeignStateAsync.resolves({ val: '123' });
            const telegramParams = {
                adapter: instance,
                userListWithChatID: [{ name: 'Alice', chatID: '123' }],
            } as any;
            const result = await instance['getChatIDAndUserToSend'](telegramParams, 'telegram.0');
            expect(result.error).to.be.false;
            expect(result.userToSend.name).to.equal('Alice');
            expect(result.chatID).to.equal('123');
        });
    });

    // ─── onUnload ───────────────────────────────────────────────────────────

    describe('onUnload', () => {
        it('should call callback', () => {
            // Stub getTimeouts to return empty array
            sinon.stub(require('@backend/app/processData'), 'getTimeouts').returns([]);
            const callback = sinon.stub();
            instance['onUnload'](callback);
            expect(callback.calledOnce).to.be.true;
            sinon.restore();
        });

        it('should clear all timeouts', () => {
            const timeout1 = {} as any;
            const timeout2 = {} as any;
            sinon.stub(require('@backend/app/processData'), 'getTimeouts').returns([
                { key: 'k1', timeout: timeout1 },
                { key: 'k2', timeout: timeout2 },
            ]);
            const callback = sinon.stub();
            instance['onUnload'](callback);
            expect(instance.clearTimeout.calledWith(timeout1)).to.be.true;
            expect(instance.clearTimeout.calledWith(timeout2)).to.be.true;
            expect(callback.calledOnce).to.be.true;
            sinon.restore();
        });
    });

    // ─── onMessage ──────────────────────────────────────────────────────────

    describe('onMessage', () => {
        it('should log info for send command', () => {
            instance.sendTo = sinon.stub();
            instance['onMessage']({ command: 'send', message: 'test', callback: 'cb', from: 'system' });
            expect(instance.log.info.calledWith('send command')).to.be.true;
            expect(instance.sendTo.calledOnce).to.be.true;
        });

        it('should not respond if no callback', () => {
            instance.sendTo = sinon.stub();
            instance['onMessage']({ command: 'send', message: 'test', from: 'system' });
            expect(instance.log.info.calledWith('send command')).to.be.true;
            expect(instance.sendTo.called).to.be.false;
        });

        it('should ignore non-send commands', () => {
            instance.sendTo = sinon.stub();
            instance['onMessage']({ command: 'other', message: 'test', from: 'system' });
            expect(instance.sendTo.called).to.be.false;
        });

        it('should ignore non-object messages', () => {
            instance.sendTo = sinon.stub();
            instance['onMessage']('string message');
            expect(instance.sendTo.called).to.be.false;
        });
    });
});

