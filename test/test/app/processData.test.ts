import { expect } from 'chai';
import sinon from 'sinon';
import { MenuProcessor } from '@backend/app/processData';
import { dynamicValue } from '@backend/app/dynamicValue';
import type { MenuData } from '@backend/types/types';
import type { UserActiveCheckbox } from '@/types/app';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('processData', () => {
    let adapterMock: any;
    let store: AppContext;
    let sendToTelegramStub: sinon.SinonStub;
    let sendNavStub: sinon.SinonStub;
    let handleSetStateStub: sinon.SinonStub;
    let getStateStub: sinon.SinonStub;
    let sendPicStub: sinon.SinonStub;
    let getChartStub: sinon.SinonStub;
    let httpRequestStub: sinon.SinonStub;
    let callSubMenuStub: sinon.SinonStub;
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
        store = createAppContextMock(adapterMock, { isUserActiveCheckbox: { menu1: true } });
        sinon.stub(store.backMenuRegistry, 'switchBack').resolves(undefined);

        sendToTelegramStub = sinon.stub(require('../../../src/app/telegram'), 'sendToTelegram').resolves();
        sinon.stub(require('../../../src/app/telegram'), 'sendLocationToTelegram').resolves();
        sendNavStub = sinon.stub(require('../../../src/app/sendNav'), 'sendNav').resolves();
        handleSetStateStub = sinon.stub(require('../../../src/app/setstate'), 'handleSetState').resolves();
        setstateIobrokerStub = sinon.stub(require('../../../src/app/setstate'), 'setstateIobroker').resolves();
        exchangeValueStub = sinon.stub(require('../../../src/app/setstate'), 'buildReturnText').resolves();
        getStateStub = sinon.stub(require('../../../src/app/getstate'), 'getState').resolves();
        sendPicStub = sinon.stub(require('../../../src/app/sendpic'), 'sendPic').returns([]);
        getChartStub = sinon.stub(require('../../../src/app/echarts'), 'getChart');
        httpRequestStub = sinon.stub(require('../../../src/app/httpRequest'), 'httpRequest').resolves(true);
        callSubMenuStub = sinon.stub(require('../../../src/app/subMenu'), 'callSubMenu').resolves({});
    });

    afterEach(() => {
        sinon.restore();
    });

    function makeMenuData(overrides: Record<string, any> = {}): MenuData {
        return {
            menu1: {
                page1: { text: 'Hello', nav: [['btn1', 'btn2']], parse_mode: false, ...overrides },
            },
        } as any;
    }

    function makeProcessor(
        navToGoTo: string,
        menuData?: MenuData,
        extra?: Partial<{
            menus: string[];
            isUserActiveCheckbox: UserActiveCheckbox;
            timeoutKey: string;
            userToSend: string;
            instance: string;
        }>,
    ): MenuProcessor {
        const processorStore =
            extra?.isUserActiveCheckbox !== undefined
                ? createAppContextMock(adapterMock, { isUserActiveCheckbox: extra.isUserActiveCheckbox })
                : store;

        return new MenuProcessor(
            processorStore,
            menuData ?? makeMenuData(),
            navToGoTo,
            extra?.menus ?? ['menu1'],
            extra?.timeoutKey ?? 'key',
            extra?.userToSend ?? 'Alice',
            extra?.instance ?? 'telegram.0',
        );
    }

    function callCheck(navToGoTo: string, menuData?: MenuData, extra?: any): Promise<boolean> {
        return makeProcessor(navToGoTo, menuData, extra).checkEveryMenuForData();
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
            sendToTelegramStub.resolves();
            await dynamicValue.setValue({
                instance: 'telegram.0',
                returnText: '{setDynamicValue:Question?:string:Confirmed:}',
                ack: false,
                id: 'state.0.input',
                userToSend: 'Alice',
                appContext: store,
                parse_mode: false,
                confirm: true,
            });

            const result = await callCheck('myAnswer');
            expect(result).to.be.true;
            expect(setstateIobrokerStub.calledOnce).to.be.true;
        });

        it('should send wrong type message when adjustValueType returns false', async () => {
            sendToTelegramStub.resolves();
            await dynamicValue.setValue({
                instance: 'telegram.0',
                returnText: '{setDynamicValue:Enter number:number:Done:}',
                ack: false,
                id: 'state.0.num',
                userToSend: 'Alice',
                appContext: store,
                parse_mode: false,
                confirm: true,
            });

            const result = await callCheck('notANumber');
            expect(result).to.be.true;
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
            const processor = makeProcessor('page1');
            const result = processor.getTimeouts();
            expect(result).to.be.an('array');
        });

        it('should accumulate timeouts from sendPic', async () => {
            sendPicStub.returns([{ timeout: 123, id: 'abc' }]);
            const md: any = {
                menu1: {
                    btnPic: { sendPic: [{ id: 'http://cam/snap', delay: 0, fileName: 'pic.jpg' }] },
                },
            };
            const processor = makeProcessor('btnPic', md);
            await processor.checkEveryMenuForData();
            expect(processor.getTimeouts()).to.deep.equal([{ timeout: 123, id: 'abc' }]);
        });
    });

    // ─── error handling ─────────────────────────────────────────────────────

    describe('error handling', () => {
        it('should propagate errors thrown by dependencies', async () => {
            sendNavStub.rejects(new Error('boom'));
            try {
                await callCheck('page1');
                expect.fail('expected error to be thrown');
            } catch (e: any) {
                expect(e.message).to.equal('boom');
            }
        });
    });
});
