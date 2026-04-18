import { expect } from 'chai';
import sinon from 'sinon';
import { saveMessageIds, deleteMessageIds } from '../../../src/app/messageIds';

describe('messageIds', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            getStateAsync: sinon.stub(),
            setState: sinon.stub().resolves(),
            getForeignStateAsync: sinon.stub(),
            sendTo: sinon.stub(),
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            supportsFeature: sinon.stub().returns(false),
        };
    });

    describe('saveMessageIds', () => {
        it('should save a new message id', async () => {
            adapterMock.getStateAsync.resolves(null);
            adapterMock.getForeignStateAsync
                .withArgs('telegram.0.communicate.requestChatId')
                .resolves({ val: '12345' });
            adapterMock.getForeignStateAsync
                .withArgs('telegram.0.communicate.request')
                .resolves({ val: 'hello' });

            const state: any = { val: 99 };
            await saveMessageIds(adapterMock, state, 'telegram.0');
            expect(adapterMock.setState.calledOnce).to.be.true;
            const savedJson = JSON.parse(adapterMock.setState.firstCall.args[1]);
            expect(savedJson['12345']).to.be.an('array');
        });

        it('should return early if requestChatId is empty', async () => {
            adapterMock.getStateAsync.resolves(null);
            adapterMock.getForeignStateAsync.resolves({ val: null });
            await saveMessageIds(adapterMock, { val: 1 } as any, 'telegram.0');
            expect(adapterMock.setState.called).to.be.false;
        });

        it('should append to existing message list', async () => {
            const existing = JSON.stringify({ '12345': [{ id: 1, time: Date.now() }] });
            adapterMock.getStateAsync.resolves({ val: existing });
            adapterMock.getForeignStateAsync
                .withArgs('telegram.0.communicate.requestChatId')
                .resolves({ val: '12345' });
            adapterMock.getForeignStateAsync
                .withArgs('telegram.0.communicate.request')
                .resolves({ val: 'hello' });

            await saveMessageIds(adapterMock, { val: 2 } as any, 'telegram.0');
            expect(adapterMock.setState.calledOnce).to.be.true;
            const savedJson = JSON.parse(adapterMock.setState.firstCall.args[1]);
            expect(savedJson['12345'].length).to.be.greaterThan(1);
        });

        it('should not add duplicate message ids', async () => {
            const existing = JSON.stringify({ '12345': [{ id: 99, time: Date.now() }] });
            adapterMock.getStateAsync.resolves({ val: existing });
            adapterMock.getForeignStateAsync
                .withArgs('telegram.0.communicate.requestChatId')
                .resolves({ val: '12345' });
            adapterMock.getForeignStateAsync
                .withArgs('telegram.0.communicate.request')
                .resolves({ val: 'hello' });

            await saveMessageIds(adapterMock, { val: 99 } as any, 'telegram.0');
            const savedJson = JSON.parse(adapterMock.setState.firstCall.args[1]);
            expect(savedJson['12345'].filter((m: any) => m.id === 99).length).to.equal(1);
        });
    });

    describe('deleteMessageIds', () => {
        it('should return early if no requestIds state', async () => {
            adapterMock.getStateAsync.resolves(null);
            adapterMock.getForeignStateAsync.resolves(null);
            const params: any = {
                adapter: adapterMock,
                userListWithChatID: [{ name: 'User1', chatID: '123' }],
            };
            await deleteMessageIds('telegram.0', 'User1', params, 'all');
            // no error, just returns
        });

        it('should delete all messages when whatShouldDelete is all', async () => {
            const msgs = JSON.stringify({ '123': [{ id: '1', time: Date.now() }, { id: '2', time: Date.now() }] });
            adapterMock.getStateAsync.resolves({ val: msgs });
            adapterMock.getForeignStateAsync.resolves(null);
            const params: any = {
                adapter: adapterMock,
                userListWithChatID: [{ name: 'User1', chatID: '123' }],
            };
            await deleteMessageIds('telegram.0', 'User1', params, 'all');
            expect(adapterMock.sendTo.callCount).to.equal(2);
        });

        it('should delete last message only when whatShouldDelete is last', async () => {
            const msgs = JSON.stringify({ '123': [{ id: '1', time: Date.now() }, { id: '2', time: Date.now() }] });
            adapterMock.getStateAsync.resolves({ val: msgs });
            adapterMock.getForeignStateAsync.resolves(null);
            const params: any = {
                adapter: adapterMock,
                userListWithChatID: [{ name: 'User1', chatID: '123' }],
            };
            await deleteMessageIds('telegram.0', 'User1', params, 'last');
            expect(adapterMock.sendTo.callCount).to.equal(1);
        });
    });
});

