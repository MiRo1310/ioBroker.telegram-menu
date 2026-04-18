import { expect } from 'chai';
import sinon from 'sinon';
import { createDynamicSwitchMenu } from '../../../src/app/dynamicSwitchMenu';

describe('dynamicSwitchMenu', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            getForeignStateAsync: sinon.stub(),
            getForeignObjectAsync: sinon.stub(),
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
        };
    });

    it('should create keyboard with correct values', async () => {
        const calledValue = 'menu:dynSwitch[10,20,30]:device1:6';
        const result = await createDynamicSwitchMenu(adapterMock, calledValue, 'device1', 'Choose');
        expect(result).to.not.be.undefined;
        expect(result?.keyboard?.inline_keyboard).to.be.an('array');
        expect(result?.text).to.equal('Choose');
        expect(result?.device).to.equal('device1');
        const buttons = result?.keyboard?.inline_keyboard.flat();
        expect(buttons).to.have.lengthOf(3);
        expect(buttons?.[0].text).to.equal('10');
    });

    it('should handle pipe-separated values (label|value)', async () => {
        const calledValue = 'menu:dynSwitch[An|true,Aus|false]:device2:6';
        const result = await createDynamicSwitchMenu(adapterMock, calledValue, 'device2', 'Toggle');
        expect(result).to.not.be.undefined;
        const buttons = result?.keyboard?.inline_keyboard.flat();
        expect(buttons?.some(b => b.text === 'An')).to.be.true;
        expect(buttons?.some(b => b.callback_data.includes('true'))).to.be.true;
    });

    it('should respect row length parameter', async () => {
        const calledValue = 'menu:dynSwitch[1,2,3,4,5,6,7,8,9]:device3:3';
        const result = await createDynamicSwitchMenu(adapterMock, calledValue, 'device3', 'Pick');
        expect(result).to.not.be.undefined;
        expect(result?.keyboard?.inline_keyboard.length).to.equal(3);
    });

    it('should default to 6 items per row if NaN', async () => {
        const calledValue = 'menu:dynSwitch[1,2,3,4,5,6,7]:device4:abc';
        const result = await createDynamicSwitchMenu(adapterMock, calledValue, 'device4', 'Pick');
        expect(result).to.not.be.undefined;
        expect(result?.keyboard?.inline_keyboard.length).to.equal(2);
    });
});
