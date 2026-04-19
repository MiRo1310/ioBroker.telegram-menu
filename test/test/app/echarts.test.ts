import { expect } from 'chai';
import sinon from 'sinon';
import { getChart } from '@backend/app/echarts';
import type { ModifiedEchart, TelegramParams } from '@backend/types/types';

describe('echarts', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;
    let validateDirectoryStub: sinon.SinonStub;
    let sendToTelegramStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            sendTo: sinon.stub(),
        };
        telegramParams = { adapter: adapterMock } as any;

        validateDirectoryStub = sinon.stub(require('@backend/lib/utils'), 'validateDirectory').returns(true);
        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
    });

    afterEach(() => {
        validateDirectoryStub.restore();
        sendToTelegramStub.restore();
    });

    it('should do nothing for an empty echarts array', () => {
        getChart('telegram.0', [], '/pics/', 'Alice', telegramParams);
        expect(adapterMock.sendTo.called).to.be.false;
    });

    it('should warn and return if preset has no valid echart instance', () => {
        const echarts: ModifiedEchart[] = [
            { preset: 'noInstance', background: '#fff', theme: 'light', filename: 'chart.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, '/pics/', 'Alice', telegramParams);
        expect(adapterMock.log.warn.calledOnce).to.be.true;
        expect(adapterMock.sendTo.called).to.be.false;
    });

    it('should return if validateDirectory returns false', () => {
        validateDirectoryStub.returns(false);
        const echarts: ModifiedEchart[] = [
            { preset: 'echart.0.myPreset', background: '#fff', theme: 'light', filename: 'chart.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, '', 'Alice', telegramParams);
        expect(adapterMock.sendTo.called).to.be.false;
    });

    it('should call adapter.sendTo with correct parameters', () => {
        const echarts: ModifiedEchart[] = [
            { preset: 'echart.0.myPreset', background: '#000', theme: 'dark', filename: 'chart.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, '/pics/', 'Alice', telegramParams);

        expect(adapterMock.sendTo.calledOnce).to.be.true;
        const [target, payload] = adapterMock.sendTo.firstCall.args;
        expect(target).to.equal('echart.0');
        expect(payload).to.deep.include({
            preset: 'echart.0.myPreset',
            renderer: 'jpg',
            background: '#000',
            theme: 'dark',
            quality: 1.0,
            fileOnDisk: '/pics/chart.jpg',
        });
    });

    it('should call sendToTelegram with filename path on success callback', async () => {
        const echarts: ModifiedEchart[] = [
            { preset: 'echart.0.myPreset', background: '#fff', theme: 'light', filename: 'chart.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, '/pics/', 'Alice', telegramParams);

        // invoke the callback passed to adapter.sendTo
        const callback = adapterMock.sendTo.firstCall.args[2];
        await callback({ error: null });

        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0]).to.deep.include({
            instance: 'telegram.0',
            userToSend: 'Alice',
            textToSend: '/pics/chart.jpg',
        });
    });

    it('should send error text when result.error is truthy', async () => {
        const echarts: ModifiedEchart[] = [
            { preset: 'echart.0.myPreset', background: '#fff', theme: 'light', filename: 'chart.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, '/pics/', 'Alice', telegramParams);

        const callback = adapterMock.sendTo.firstCall.args[2];
        await callback({ error: 'Render failed' });

        expect(sendToTelegramStub.calledOnce).to.be.true;
        expect(sendToTelegramStub.firstCall.args[0].textToSend).to.equal('Render failed');
    });

    it('should process multiple echarts entries', () => {
        const echarts: ModifiedEchart[] = [
            { preset: 'echart.0.p1', background: '#fff', theme: 'light', filename: 'a.jpg', echartsInstance: '' },
            { preset: 'echart.0.p2', background: '#000', theme: 'dark', filename: 'b.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, '/pics/', 'Alice', telegramParams);
        expect(adapterMock.sendTo.calledTwice).to.be.true;
    });

    it('should stop processing after first invalid preset', () => {
        const echarts: ModifiedEchart[] = [
            { preset: 'noInstance', background: '#fff', theme: 'light', filename: 'a.jpg', echartsInstance: '' },
            { preset: 'echart.0.p2', background: '#000', theme: 'dark', filename: 'b.jpg', echartsInstance: '' },
        ];
        getChart('telegram.0', echarts, '/pics/', 'Alice', telegramParams);
        // returns after first invalid preset, so sendTo is never called
        expect(adapterMock.sendTo.called).to.be.false;
    });
});

