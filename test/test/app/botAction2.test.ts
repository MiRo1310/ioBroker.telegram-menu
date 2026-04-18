import { expect } from 'chai';
import sinon from 'sinon';
import { deleteMessageByBot } from '../../../src/app/botAction';

describe('botAction', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            sendTo: sinon.stub(),
            log: { debug: sinon.stub(), error: sinon.stub() },
            supportsFeature: sinon.stub().returns(false),
        };
    });

    it('should call sendTo with deleteMessage payload', () => {
        deleteMessageByBot(adapterMock, 'telegram.0', 'User1', 42, '12345');
        expect(adapterMock.sendTo.calledOnce).to.be.true;
        const args = adapterMock.sendTo.firstCall.args;
        expect(args[0]).to.equal('telegram.0');
        expect(args[1].deleteMessage.options.chat_id).to.equal('12345');
        expect(args[1].deleteMessage.options.message_id).to.equal(42);
    });

    it('should log debug if chat_id is provided', () => {
        deleteMessageByBot(adapterMock, 'telegram.0', 'User1', 42, '12345');
        expect(adapterMock.log.debug.calledOnce).to.be.true;
    });

    it('should not log debug if chat_id is empty', () => {
        deleteMessageByBot(adapterMock, 'telegram.0', 'User1', 42, '');
        expect(adapterMock.log.debug.called).to.be.false;
    });

    it('should handle numeric chat_id', () => {
        deleteMessageByBot(adapterMock, 'telegram.0', 'User1', 42, 12345);
        expect(adapterMock.sendTo.calledOnce).to.be.true;
    });
});
