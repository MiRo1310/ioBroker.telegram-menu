import { expect } from 'chai';
import { AppContext } from '@backend/app/appContext';

describe('Store', () => {
    // ─── ID methods (via createStoreMock — verified equal to real Store methods) ──

    describe('ID methods', () => {
        it('should return correct telegramRequestID', () => {
            expect(AppContext.telegramRequestID('telegram.0')).to.equal('telegram.0.communicate.request');
        });

        it('should return correct telegramBotSendMessageID', () => {
            expect(AppContext.telegramBotSendMessageID('telegram.0')).to.equal(
                'telegram.0.communicate.botSendMessageId',
            );
        });

        it('should return correct telegramRequestMessageID', () => {
            expect(AppContext.telegramRequestMessageID('telegram.0')).to.equal(
                'telegram.0.communicate.requestMessageId',
            );
        });

        it('should return correct telegramInfoConnectionID', () => {
            expect(AppContext.telegramInfoConnectionID('telegram.0')).to.equal('telegram.0.info.connection');
        });

        it('should return correct telegramRequestChatID', () => {
            expect(AppContext.telegramRequestChatID('telegram.0')).to.equal('telegram.0.communicate.requestChatId');
        });

        it('should work with different instance names', () => {
            expect(AppContext.telegramRequestID('telegram.1')).to.equal('telegram.1.communicate.request');
            expect(AppContext.telegramInfoConnectionID('telegram.2')).to.equal('telegram.2.info.connection');
        });
    });

    // ─── Store constructor (reads adapter.config) ───────────────────────────

    describe('constructor — config parsing', () => {
        function makeAdapterWithConfig(config: any) {
            return { config, log: { debug: () => {} } } as any;
        }

        it('should parse full config correctly', () => {
            const adapter = makeAdapterWithConfig({
                instanceList: [{ name: 'telegram.0', active: true }],
                checkbox: {
                    resKey: true,
                    oneTiKey: false,
                    checkboxNoValueFound: true,
                    sendMenuAfterRestart: false,
                },
                userListWithChatID: [{ chatID: '123', name: 'User1' }],
                usersInGroup: { menu1: [{ name: 'User1' }] },
                tokenGrafana: 'token123',
                directory: '/tmp/pics/',
                userActiveCheckbox: { menu1: true },
                textNoEntry: 'Not found',
                data: { menu1: {} },
            });

            const store = new AppContext(adapter);

            expect(store.checkboxNoEntryFound).to.equal(true);
            expect(store.sendMenuAfterRestart).to.equal(false);
            expect(store.resize_keyboard).to.equal(true);
            expect(store.one_time_keyboard).to.equal(false);
            expect(store.token).to.equal('token123');
            expect(store.directoryPicture).to.equal('/tmp/pics/');
            expect(store.textNoEntryFound).to.equal('Not found');
            expect(store.telegramInstanceList).to.deep.equal([{ name: 'telegram.0', active: true }]);
            expect(store.listOfMenus).to.deep.equal(['menu1']);
            expect(store.userListWithChatID).to.deep.equal([{ chatID: '123', name: 'User1' }]);
            expect(store.isUserActiveCheckbox).to.deep.equal({ menu1: true });
        });

        it('should use default directory when not provided', () => {
            const adapter = makeAdapterWithConfig({
                instanceList: [],
                checkbox: { resKey: false, oneTiKey: false, checkboxNoValueFound: false, sendMenuAfterRestart: false },
                userListWithChatID: [],
                usersInGroup: {},
                userActiveCheckbox: {},
                data: {},
                tokenGrafana: '',
                textNoEntry: undefined,
            });

            const store = new AppContext(adapter);
            expect(store.directoryPicture).to.equal('/opt/iobroker/media/');
            expect(store.textNoEntryFound).to.equal('Entry not found');
            expect(store.listOfMenus).to.deep.equal([]);
        });

        it('should derive listOfMenus from usersInGroup keys', () => {
            const adapter = makeAdapterWithConfig({
                instanceList: [],
                checkbox: { resKey: false, oneTiKey: false, checkboxNoValueFound: false, sendMenuAfterRestart: false },
                userListWithChatID: [],
                usersInGroup: { menuA: [], menuB: [], menuC: [] },
                userActiveCheckbox: {},
                data: {},
                tokenGrafana: '',
            });

            const store = new AppContext(adapter);
            expect(store.listOfMenus).to.have.members(['menuA', 'menuB', 'menuC']);
        });

        it('should default instanceList and listOfMenus when config values are missing (lines 27/34)', () => {
            // Echter Test statt istanbul-ignore: Erststart ohne gespeicherte Config liefert undefined-Werte
            const adapter = makeAdapterWithConfig({
                instanceList: undefined,
                checkbox: { resKey: false, oneTiKey: false, checkboxNoValueFound: false, sendMenuAfterRestart: false },
                userListWithChatID: [],
                usersInGroup: undefined,
                userActiveCheckbox: {},
                data: {},
                tokenGrafana: '',
            });

            const store = new AppContext(adapter);
            expect(store.telegramInstanceList).to.deep.equal([]);
            expect(store.listOfMenus).to.deep.equal([]);
        });

        it('should create backMenuRegistry and stateIdRegistry instances', () => {
            const adapter = makeAdapterWithConfig({
                instanceList: [],
                checkbox: { resKey: false, oneTiKey: false, checkboxNoValueFound: false, sendMenuAfterRestart: false },
                userListWithChatID: [],
                usersInGroup: {},
                userActiveCheckbox: {},
                data: {},
                tokenGrafana: '',
            });

            const store = new AppContext(adapter);
            expect(store.backMenuRegistry).to.not.be.undefined;
            expect(store.stateIdRegistry).to.not.be.undefined;
            expect(store.stateIdRegistry.getIds()).to.be.an('array').that.is.empty;
        });
    });
});
