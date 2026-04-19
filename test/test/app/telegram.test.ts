import { expect } from 'chai';
import sinon from 'sinon';
import { sendToTelegram, sendToTelegramSubmenu, sendLocationToTelegram } from '@backend/app/telegram';
import type { TelegramParams } from '@backend/types/types';

describe('telegram', () => {
    let adapterMock: any;
    let telegramParams: TelegramParams;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            sendTo: sinon.stub(),
            getForeignStateAsync: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
        };
        telegramParams = {
            adapter: adapterMock,
            resize_keyboard: true,
            one_time_keyboard: false,
            userListWithChatID: [{ name: 'Alice', chatID: '123', instance: 'telegram.0' }],
            telegramInstanceList: [{ name: 'telegram.0', active: true }],
        } as any;
    });

    afterEach(() => {
        sinon.restore();
    });

    // ─── sendToTelegram ─────────────────────────────────────────────────────

    describe('sendToTelegram', () => {
        it('should send text without keyboard', async () => {
            await sendToTelegram({
                instance: 'telegram.0',
                userToSend: 'Alice',
                textToSend: 'Hello',
                telegramParams,
            });
            expect(adapterMock.sendTo.calledOnce).to.be.true;
            const args = adapterMock.sendTo.firstCall.args;
            expect(args[0]).to.equal('telegram.0');
            expect(args[1]).to.equal('send');
            expect(args[2].text).to.include('Hello');
            expect(args[2].chatId).to.equal('123');
        });

        it('should send text with keyboard', async () => {
            await sendToTelegram({
                instance: 'telegram.0',
                userToSend: 'Alice',
                textToSend: 'Pick one',
                keyboard: [['btn1', 'btn2']],
                telegramParams,
            });
            expect(adapterMock.sendTo.calledOnce).to.be.true;
            const payload = adapterMock.sendTo.firstCall.args[2];
            expect(payload.reply_markup).to.not.be.undefined;
            expect(payload.reply_markup.keyboard).to.deep.equal([['btn1', 'btn2']]);
            expect(payload.reply_markup.resize_keyboard).to.be.true;
        });

        it('should return early when instance is empty', async () => {
            await sendToTelegram({
                instance: '',
                userToSend: 'Alice',
                textToSend: 'Hello',
                telegramParams,
            });
            expect(adapterMock.sendTo.called).to.be.false;
        });

        it('should return early when instance is not active', async () => {
            telegramParams.telegramInstanceList = [{ name: 'telegram.0', active: false }] as any;
            await sendToTelegram({
                instance: 'telegram.0',
                userToSend: 'Alice',
                textToSend: 'Hello',
                telegramParams,
            });
            expect(adapterMock.sendTo.called).to.be.false;
        });

        it('should log error when textToSend is empty', async () => {
            await sendToTelegram({
                instance: 'telegram.0',
                userToSend: 'Alice',
                textToSend: '',
                telegramParams,
            });
            expect(adapterMock.log.error.called).to.be.true;
        });

        it('should warn when text contains change{', async () => {
            await sendToTelegram({
                instance: 'telegram.0',
                userToSend: 'Alice',
                textToSend: 'change{something}',
                telegramParams,
            });
            expect(adapterMock.log.warn.called).to.be.true;
        });

        it('should use parse_mode when provided', async () => {
            await sendToTelegram({
                instance: 'telegram.0',
                userToSend: 'Alice',
                textToSend: '<b>Bold</b>',
                telegramParams,
                parse_mode: true,
            });
            expect(adapterMock.sendTo.calledOnce).to.be.true;
            const payload = adapterMock.sendTo.firstCall.args[2];
            expect(payload.parse_mode).to.equal('HTML');
        });

        it('should catch errors', async () => {
            adapterMock.sendTo.throws(new Error('send error'));
            await sendToTelegram({
                instance: 'telegram.0',
                userToSend: 'Alice',
                textToSend: 'Hello',
                telegramParams,
            });
            expect(adapterMock.log.error.called).to.be.true;
        });
    });

    // ─── sendToTelegramSubmenu ───────────────────────────────────────────────

    describe('sendToTelegramSubmenu', () => {
        it('should send inline keyboard', () => {
            const keyboard = { inline_keyboard: [[{ text: 'Opt1', callback_data: 'cb1' }]] };
            sendToTelegramSubmenu('telegram.0', 'Alice', 'Choose', keyboard, telegramParams);
            expect(adapterMock.sendTo.calledOnce).to.be.true;
            const payload = adapterMock.sendTo.firstCall.args[2];
            expect(payload.reply_markup).to.equal(keyboard);
            expect(payload.chatId).to.equal('123');
        });

        it('should not send when text is empty', () => {
            const keyboard = { inline_keyboard: [[{ text: 'Opt1', callback_data: 'cb1' }]] };
            sendToTelegramSubmenu('telegram.0', 'Alice', '', keyboard, telegramParams);
            expect(adapterMock.sendTo.called).to.be.false;
            expect(adapterMock.log.error.called).to.be.true;
        });

        it('should use parse_mode when provided', () => {
            const keyboard = { inline_keyboard: [[{ text: 'X', callback_data: 'x' }]] };
            sendToTelegramSubmenu('telegram.0', 'Alice', '<b>Bold</b>', keyboard, telegramParams, true);
            const payload = adapterMock.sendTo.firstCall.args[2];
            expect(payload.parse_mode).to.equal('HTML');
        });
    });

    // ─── sendLocationToTelegram ─────────────────────────────────────────────

    describe('sendLocationToTelegram', () => {
        it('should send location with lat/lng from states', async () => {
            adapterMock.getForeignStateAsync.withArgs('state.0.lat').resolves({ val: 52.52 });
            adapterMock.getForeignStateAsync.withArgs('state.0.lng').resolves({ val: 13.405 });

            await sendLocationToTelegram(
                'telegram.0',
                'Alice',
                [{ latitude: 'state.0.lat', longitude: 'state.0.lng' }],
                telegramParams,
            );

            expect(adapterMock.sendTo.calledOnce).to.be.true;
            const payload = adapterMock.sendTo.firstCall.args[1];
            expect(payload.latitude).to.equal(52.52);
            expect(payload.longitude).to.equal(13.405);
            expect(payload.disable_notification).to.be.true;
        });

        it('should skip entry when both lat and lng are empty', async () => {
            await sendLocationToTelegram(
                'telegram.0',
                'Alice',
                [{ latitude: '', longitude: '' }],
                telegramParams,
            );
            expect(adapterMock.sendTo.called).to.be.false;
        });

        it('should skip entry when latitude state is null', async () => {
            adapterMock.getForeignStateAsync.withArgs('state.0.lat').resolves(null);
            adapterMock.getForeignStateAsync.withArgs('state.0.lng').resolves({ val: 13.4 });

            await sendLocationToTelegram(
                'telegram.0',
                'Alice',
                [{ latitude: 'state.0.lat', longitude: 'state.0.lng' }],
                telegramParams,
            );
            expect(adapterMock.sendTo.called).to.be.false;
        });

        it('should skip entry when longitude state is null', async () => {
            adapterMock.getForeignStateAsync.withArgs('state.0.lat').resolves({ val: 52.5 });
            adapterMock.getForeignStateAsync.withArgs('state.0.lng').resolves(null);

            await sendLocationToTelegram(
                'telegram.0',
                'Alice',
                [{ latitude: 'state.0.lat', longitude: 'state.0.lng' }],
                telegramParams,
            );
            expect(adapterMock.sendTo.called).to.be.false;
        });

        it('should process multiple locations', async () => {
            adapterMock.getForeignStateAsync.resolves({ val: 50.0 });

            await sendLocationToTelegram(
                'telegram.0',
                'Alice',
                [
                    { latitude: 'state.0.lat1', longitude: 'state.0.lng1' },
                    { latitude: 'state.0.lat2', longitude: 'state.0.lng2' },
                ],
                telegramParams,
            );
            expect(adapterMock.sendTo.calledTwice).to.be.true;
        });

        it('should catch errors', async () => {
            adapterMock.getForeignStateAsync.rejects(new Error('state error'));

            await sendLocationToTelegram(
                'telegram.0',
                'Alice',
                [{ latitude: 'state.0.lat', longitude: 'state.0.lng' }],
                telegramParams,
            );
            expect(adapterMock.log.error.called).to.be.true;
        });
    });
});

