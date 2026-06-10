import { expect } from 'chai';
import sinon from 'sinon';
import { getChart } from '@backend/app/echarts';
import type { ModifiedEchart } from '@backend/types/types';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('echarts', () => {
    let adapterMock: any;
    let store: AppContext;
    let validateDirectoryStub: sinon.SinonStub;
    let sendToTelegramStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            sendTo: sinon.stub(),
        };
        store = createAppContextMock(adapterMock);

        validateDirectoryStub = sinon.stub(require('@backend/lib/utils'), 'validateDirectory').returns(true);
        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(() => {
        validateDirectoryStub.restore();
        sendToTelegramStub.restore();
    });

    it('should do nothing for an empty echarts array', () => {
        getChart('telegram.0', [], 'Alice', store);
        expect(adapterMock.sendTo.called).to.be.false;
    });

    it('should warn and return if preset has no valid echart instance', () => {
        const echarts: ModifiedEchart[] = [
            { preset: 'noInstance', background: '#fff', theme: 'light', filename: 'chart.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, 'Alice', store);
        expect(adapterMock.log.warn.calledOnce).to.be.true;
        expect(adapterMock.sendTo.called).to.be.false;
    });

    it('should return if validateDirectory returns false', () => {
        validateDirectoryStub.returns(false);
        const echarts: ModifiedEchart[] = [
            {
                preset: 'echart.0.myPreset',
                background: '#fff',
                theme: 'light',
                filename: 'chart.jpg',
                echartsInstance: '',
            },
        ];
        getChart('telegram.0', echarts, 'Alice', store);
        expect(adapterMock.sendTo.called).to.be.false;
    });

    it('should call adapter.sendTo with correct parameters', () => {
        const echarts: ModifiedEchart[] = [
            {
                preset: 'echart.0.myPreset',
                background: '#000',
                theme: 'dark',
                filename: 'chart.jpg',
                echartsInstance: '',
            },
        ];
        getChart('telegram.0', echarts, 'Alice', store);
        expect(adapterMock.sendTo.calledOnce).to.be.true;
        const args = adapterMock.sendTo.firstCall.args;
        expect(args[0]).to.equal('echart.0');
        expect(args[1]).to.equal('send');
    });

    it('should use echartsInstance from preset when available', () => {
        const echarts: ModifiedEchart[] = [
            {
                preset: 'echart.0.myPreset',
                background: '#fff',
                theme: 'light',
                filename: 'chart.jpg',
                echartsInstance: 'echart.1',
            },
        ];
        getChart('telegram.0', echarts, 'Alice', store);
        expect(adapterMock.sendTo.calledOnce).to.be.true;
        expect(adapterMock.sendTo.firstCall.args[0]).to.equal('echart.1');
    });
});
