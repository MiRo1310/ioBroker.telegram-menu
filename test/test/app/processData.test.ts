import { expect } from 'chai';
import sinon from 'sinon';
import { checkEveryMenuForData, getTimeouts } from '@backend/app/processData';
import { dynamicValue } from '@backend/app/dynamicValue';
import type { MenuData, TelegramParams } from '@backend/types/types';

describe('processData', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;
    let sendToTelegramStub: sinon.SinonStub;
    let sendNavStub: sinon.SinonStub;
    let handleSetStateStub: sinon.SinonStub;
    let getStateStub: sinon.SinonStub;
    let sendPicStub: sinon.SinonStub;
    let sendLocationStub: sinon.SinonStub;
    let getChartStub: sinon.SinonStub;
    let httpRequestStub: sinon.SinonStub;
    let callSubMenuStub: sinon.SinonStub;
    let switchBackStub: sinon.SinonStub;
    let setstateIobrokerStub: sinon.SinonStub;
    let exchangeValueStub: sinon.SinonStub;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignStateAsync: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
            setTimeout: sinon.stub(),
            clearTimeout: sinon.stub(),
        };
        telegramParams = { adapter: adapterMock } as any;

        sendToTelegramStub = sinon.stub(require('@backend/app/telegram'), 'sendToTelegram').resolves();
        sinon.stub(require('@backend/app/telegram'), 'sendLocationToTelegram').resolves();
        sendLocationStub = require('@backend/app/telegram').sendLocationToTelegram;
        sendNavStub = sinon.stub(require('@backend/app/sendNav'), 'sendNav').resolves();
        handleSetStateStub = sinon.stub(require('@backend/app/setstate'), 'handleSetState').resolves();
        setstateIobrokerStub = sinon.stub(require('@backend/app/setstate'), 'setstateIobroker').resolves();
        exchangeValueStub = sinon.stub(require('@backend/app/setstate'), 'exchangeValueAndSendToTelegram').resolves();
        getStateStub = sinon.stub(require('@backend/app/getstate'), 'getState').resolves();
        sendPicStub = sinon.stub(require('@backend/app/sendpic'), 'sendPic').returns([]);
        getChartStub = sinon.stub(require('@backend/app/echarts'), 'getChart');
        httpRequestStub = sinon.stub(require('@backend/app/httpRequest'), 'httpRequest').resolves(true);
        callSubMenuStub = sinon.stub(require('@backend/app/subMenu'), 'callSubMenu').resolves({});
        switchBackStub = sinon.stub(require('@backend/app/backMenu'), 'switchBack').resolves(undefined);
    });

    afterEach(() => {
        sinon.restore();
    });

    // Helper to build menuData
    function makeMenuData(overrides: Record<string, any> = {}): MenuData {
        return {
            menu1: {
                page1: { text: 'Hello', nav: [['btn1', 'btn2']], parse_mode: false, ...overrides },
            },
        } as any;
    }

    function callCheck(navToGoTo: string, menuData?: MenuData, extra?: any) {
        return checkEveryMenuForData({
            instance: 'telegram.0',
            menuData: menuData ?? makeMenuData(),
            navToGoTo,
            userToSend: 'Alice',
            telegramParams,
            menus: ['menu1'],
            isUserActiveCheckbox: { menu1: true },
            token: 'tok',
            directoryPicture: '/pics/',
            timeoutKey: 'key',
            ...extra,
        });
    }

    // ─── checkEveryMenuForData ──────────────────────────────────────────────

    describe('checkEveryMenuForData', () => {
        it('should return true when nav is found for calledValue', async () => {
            const result = await callCheck('page1');
            expect(result).to.be.true;
            expect(sendNavStub.calledOnce).to.be.true;
        });

        it('should return false when calledValue does not match any page', async () => {
            const result = await callCheck('nonExistent');
            expect(result).to.be.false;
        });

        it('should return true when part has switch', async () => {
            const md: any = {
                menu1: {
                    btnSwitch: {
                        switch: [{ id: 'state.0.light', value: 'true', toggle: false, confirm: false, ack: false }],
                    },
                },
            };
            const result = await callCheck('btnSwitch', md);
            expect(result).to.be.true;
            expect(handleSetStateStub.calledOnce).to.be.true;
        });

        it('should return true when part has getData', async () => {
            const md: any = {
                menu1: {
                    btnGet: { getData: [{ id: 'state.0.temp', text: 'Temp:' }] },
                },
            };
            const result = await callCheck('btnGet', md);
            expect(result).to.be.true;
            expect(getStateStub.calledOnce).to.be.true;
        });

        it('should return true when part has sendPic', async () => {
            const md: any = {
                menu1: {
                    btnPic: { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'pic.jpg' }] },
                },
            };
            const result = await callCheck('btnPic', md);
            expect(result).to.be.true;
            expect(sendPicStub.calledOnce).to.be.true;
        });

        it('should return true when part has location', async () => {
            const md: any = {
                menu1: {
                    btnLoc: { location: [{ latitude: 52.5, longitude: 13.4 }] },
                },
            };
            const result = await callCheck('btnLoc', md);
            expect(result).to.be.true;
        });

        it('should return true when part has echarts', async () => {
            const md: any = {
                menu1: {
                    btnChart: {
                        echarts: [
                            {
                                preset: 'echart.0.p1',
                                background: '#fff',
                                theme: 'light',
                                filename: 'c.jpg',
                                echartsInstance: '',
                            },
                        ],
                    },
                },
            };
            const result = await callCheck('btnChart', md);
            expect(result).to.be.true;
            expect(getChartStub.calledOnce).to.be.true;
        });

        it('should return true when part has httpRequest', async () => {
            const md: any = {
                menu1: {
                    btnHttp: {
                        httpRequest: [{ url: 'https://example.com', user: '', password: '', filename: '', delay: '0' }],
                    },
                },
            };
            const result = await callCheck('btnHttp', md);
            expect(result).to.be.true;
            expect(httpRequestStub.calledOnce).to.be.true;
        });

        it('should return false when httpRequest returns falsy', async () => {
            httpRequestStub.resolves(false);
            const md: any = {
                menu1: {
                    btnHttp: {
                        httpRequest: [{ url: 'https://example.com', user: '', password: '', filename: '', delay: '0' }],
                    },
                },
            };
            const result = await callCheck('btnHttp', md);
            expect(result).to.be.false;
        });

        it('should return false when menu is inactive', async () => {
            const result = await callCheck('page1', makeMenuData(), {
                isUserActiveCheckbox: { menu1: false },
            });
            expect(result).to.be.false;
        });
    });

    // ─── processData with dynamicValue ──────────────────────────────────────

    describe('dynamicValue path', () => {
        afterEach(() => {
            dynamicValue.removeUser('Alice');
        });

        it('should set state and send confirmation when dynamicValue is set', async () => {
            // Pre-set a dynamic value for the user
            sendToTelegramStub.resolves();
            await dynamicValue.setValue(
                'telegram.0',
                '{setDynamicValue:Question?:string:Confirmed:}',
                false,
                'state.0.input',
                'Alice',
                telegramParams,
                false,
                true,
            );

            const result = await callCheck('myAnswer');
            expect(result).to.be.true;
            expect(setstateIobrokerStub.calledOnce).to.be.true;
        });

        it('should send wrong type message when adjustValueType returns false', async () => {
            sendToTelegramStub.resolves();
            await dynamicValue.setValue(
                'telegram.0',
                '{setDynamicValue:Enter number:number:Done:}',
                false,
                'state.0.num',
                'Alice',
                telegramParams,
                false,
                true,
            );

            const result = await callCheck('notANumber');
            expect(result).to.be.true;
            // adjustValueType returns false for non-numeric → sendToTelegram with wrong type msg
            expect(sendToTelegramStub.called).to.be.true;
        });
    });

    // ─── submenu handling ───────────────────────────────────────────────────

    describe('submenu handling', () => {
        it('should call callSubMenu when nav contains menu:', async () => {
            const md: any = {
                menu1: {
                    page1: { text: 'Hello', nav: [['menu:menu2:page1']], parse_mode: false },
                },
            };
            callSubMenuStub.resolves({});
            const result = await callCheck('page1', md);
            expect(result).to.be.true;
            expect(callSubMenuStub.calledOnce).to.be.true;
        });

        it('should recursively call checkEveryMenuForData when submenu returns newNav', async () => {
            const md: any = {
                menu1: {
                    page1: { text: 'Hello', nav: [['menu:menu1:page1']], parse_mode: false },
                },
            };
            // First call returns newNav, second call returns nothing
            callSubMenuStub.onFirstCall().resolves({ newNav: 'page1' });
            callSubMenuStub.onSecondCall().resolves({});
            const result = await callCheck('page1', md);
            expect(result).to.be.true;
        });

        it('should handle menu: prefix in calledValue via isSubmenuOrMenu', async () => {
            const md: any = {
                menu1: {
                    page1: { text: 'Submenu', nav: [['btn']], parse_mode: false },
                },
            };
            callSubMenuStub.resolves({});
            const result = await callCheck('menu:menu1:page1', md);
            expect(result).to.be.true;
        });
    });

    // ─── getTimeouts ────────────────────────────────────────────────────────

    describe('getTimeouts', () => {
        it('should return the timeouts array', () => {
            const result = getTimeouts();
            expect(result).to.be.an('array');
        });
    });

    // ─── error handling ─────────────────────────────────────────────────────

    describe('error handling', () => {
        it('should catch errors and return false from checkEveryMenuForData', async () => {
            sendNavStub.rejects(new Error('boom'));
            const result = await callCheck('page1');
            // processData catches the error → returns undefined → checkEveryMenuForData sees falsy → returns false
            expect(result).to.be.false;
            expect(adapterMock.log.error.called).to.be.true;
        });
    });
});
