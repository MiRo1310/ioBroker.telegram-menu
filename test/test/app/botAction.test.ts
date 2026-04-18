import { expect } from 'chai';
import sinon from 'sinon';
import { deleteMessageByBot } from '../../../src/app/botAction';

describe('botAction', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), error: sinon.stub() },
            sendTo: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
        };
    });

    it('should call sendTo with deleteMessage payload', () => {
        deleteMessageByBot(adapterMock, 'telegram.0', 'Michael', 42, 12345);

        expect(adapterMock.sendTo.calledOnce).to.be.true;
        const args = adapterMock.sendTo.firstCall.args;
        expect(args[0]).to.equal('telegram.0');
        expect(args[1]).to.deep.equal({
            deleteMessage: {
                options: {
                    chat_id: 12345,
                    message_id: 42,
                },
            },
        });
    });

    it('should log debug message when chat_id is provided', () => {
        deleteMessageByBot(adapterMock, 'telegram.0', 'Michael', 42, 12345);
        expect(adapterMock.log.debug.calledOnce).to.be.true;
    });

    it('should not log debug message when chat_id is falsy', () => {
        deleteMessageByBot(adapterMock, 'telegram.0', 'Michael', 42, 0);
        expect(adapterMock.log.debug.called).to.be.false;
        expect(adapterMock.sendTo.calledOnce).to.be.true;
    });

    it('should not throw if sendTo throws', () => {
        adapterMock.sendTo.throws(new Error('send failed'));
        expect(() => deleteMessageByBot(adapterMock, 'telegram.0', 'Michael', 42, 12345)).to.not.throw();
    });
});

