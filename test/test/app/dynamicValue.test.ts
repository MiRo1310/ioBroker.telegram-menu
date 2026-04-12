import { expect } from 'chai';
import sinon from 'sinon';
import { dynamicValue } from '@backend/app/dynamicValue';
import { telegramParams } from '../../fixtures/telegramParams';

describe('DynamicValueHandler', function () {
    let sendToTelegramStub: { restore: () => void; calledOnce: any };

    beforeEach(function () {
        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(function () {
        sendToTelegramStub.restore();
        // Clean up dynamicValueObj for isolation
        dynamicValue.removeUser('testUser');
    });

    it('should set, get and remove dynamic value for a user', async function () {
        const result = await dynamicValue.setValue(
            'instance1',
            '{setDynamicValue:question:type:confirmText:nav}',
            true,
            'id1',
            'testUser',
            telegramParams,
            true,
            true,
        );
        expect(result).to.have.property('confirmText', 'confirmText');
        expect(result).to.have.property('id', 'nav');
        expect(sendToTelegramStub.calledOnce).to.be.true;

        const value = dynamicValue.getValue('testUser');
        expect(value).to.be.an('object');
        expect(value).to.have.property('id', 'id1');

        const removed = dynamicValue.removeUser('testUser');
        expect(removed).to.be.true;
        expect(dynamicValue.getValue('testUser')).to.be.null;
    });

    it('should return null for unknown user', function () {
        expect(dynamicValue.getValue('unknown')).to.be.null;
    });
});
