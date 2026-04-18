import { expect } from 'chai';
import { getConfigVariables, getIds } from '../../../src/app/configVariables';

describe('configVariables', () => {
    describe('getIds', () => {
        it('should return correct telegramRequestID', () => {
            expect(getIds.telegramRequestID('telegram.0')).to.equal('telegram.0.communicate.request');
        });

        it('should return correct telegramBotSendMessageID', () => {
            expect(getIds.telegramBotSendMessageID('telegram.0')).to.equal('telegram.0.communicate.botSendMessageId');
        });

        it('should return correct telegramRequestMessageID', () => {
            expect(getIds.telegramRequestMessageID('telegram.0')).to.equal('telegram.0.communicate.requestMessageId');
        });

        it('should return correct telegramInfoConnectionID', () => {
            expect(getIds.telegramInfoConnectionID('telegram.0')).to.equal('telegram.0.info.connection');
        });

        it('should return correct telegramRequestChatID', () => {
            expect(getIds.telegramRequestChatID('telegram.0')).to.equal('telegram.0.communicate.requestChatId');
        });
    });

    describe('getConfigVariables', () => {
        it('should return correct config variables', () => {
            const adapterMock: any = { log: { debug: () => {} } };
            const config: any = {
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
            };

            const result = getConfigVariables(config, adapterMock);

            expect(result.checkboxNoEntryFound).to.equal(true);
            expect(result.sendMenuAfterRestart).to.equal(false);
            expect(result.listOfMenus).to.deep.equal(['menu1']);
            expect(result.token).to.equal('token123');
            expect(result.directoryPicture).to.equal('/tmp/pics/');
            expect(result.textNoEntryFound).to.equal('Not found');
            expect(result.telegramParams.resize_keyboard).to.equal(true);
            expect(result.telegramParams.one_time_keyboard).to.equal(false);
        });

        it('should use default directory if not provided', () => {
            const adapterMock: any = { log: { debug: () => {} } };
            const config: any = {
                instanceList: [],
                checkbox: { resKey: false, oneTiKey: false, checkboxNoValueFound: false, sendMenuAfterRestart: false },
                userListWithChatID: [],
                userActiveCheckbox: {},
                data: {},
                tokenGrafana: '',
            };

            const result = getConfigVariables(config, adapterMock);
            expect(result.directoryPicture).to.equal('/opt/iobroker/media/');
            expect(result.textNoEntryFound).to.equal('Entry not found');
            expect(result.listOfMenus).to.deep.equal([]);
        });
    });
});

