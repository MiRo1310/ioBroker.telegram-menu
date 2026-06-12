import { expect } from 'chai';
import sinon from 'sinon';
import { dynamicValue } from '@backend/app/dynamicValue';
import { store } from '../../fixtures/telegramParams';

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
            store,
            'instance1',
            '{setDynamicValue:question:type:confirmText:nav}',
            true,
            'id1',
            'testUser',
            true,
            true,
        );
        expect(result).to.have.property('confirmText', 'confirmText');
        expect(result).to.have.property('id', 'nav');
        expect(sendToTelegramStub.calledOnce).to.be.true;

        const value = dynamicValue.getValue('testUser');
        expect(value).to.be.an('object');
        expect(value).to.have.property('idToSet', 'id1');

        const removed = dynamicValue.removeUser('testUser');
        expect(removed).to.be.true;
        expect(dynamicValue.getValue('testUser')).to.be.null;
    });

    it('should return null when getting value for unknown user', function () {
        const value = dynamicValue.getValue('unknownUser');
        expect(value).to.be.null;
    });

    it('should return false when removing unknown user', function () {
        const result = dynamicValue.removeUser('unknownUser');
        expect(result).to.be.false;
    });

    it('should set a dynamic value with confirm=false', async function () {
        const result = await dynamicValue.setValue(
            store,
            'instance1',
            '{setDynamicValue:question2:number:confirm2}',
            false,
            'id2',
            'testUser2',
            false,
            false,
        );
        expect(result).to.have.property('confirmText', 'confirm2');
        dynamicValue.removeUser('testUser2');
    });

    it('should return empty confirmText and undefined id when confirmText is empty', async function () {
        const result = await dynamicValue.setValue(
            store,
            'instance1',
            '{setDynamicValue:question3:string:}',
            false,
            'id3',
            'testUser3',
            false,
            false,
        );
        expect(result).to.have.property('confirmText', '');
        expect(result).to.have.property('id', undefined);
        dynamicValue.removeUser('testUser3');
    });
});
