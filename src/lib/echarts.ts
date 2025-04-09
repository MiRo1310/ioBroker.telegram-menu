import TelegramMenu from '../main';
import { error } from './logging';
import { sendToTelegram } from './telegram';
import type { Echart, UserListWithChatId } from '../types/types';
import { checkDirectoryIsOk } from './global';

function getChart(
    echarts: Echart[],
    directoryPicture: string,
    user: string,
    instanceTelegram: string,
    userListWithChatID: UserListWithChatId[],
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
): void {
    const _this = TelegramMenu.getInstance();
    try {
        if (!echarts) {
            return;
        }
        for (const echart of echarts) {
            const splitPreset = echart.preset.split('.');
            const instanceOfEchart = `${splitPreset[0]}.${splitPreset[1]}`;

            if (!checkDirectoryIsOk(directoryPicture)) {
                return;
            }
            _this.sendTo(
                instanceOfEchart,
                {
                    preset: echart.preset,
                    renderer: 'jpg',
                    background: echart.background,
                    theme: echart.theme,
                    quality: 1.0,
                    fileOnDisk: directoryPicture + echart.filename,
                },
                (result: any) => {
                    sendToTelegram({
                        user: user,
                        textToSend: result.error || directoryPicture + echart.filename,
                        instance: instanceTelegram,
                        resize_keyboard: resize_keyboard,
                        one_time_keyboard: one_time_keyboard,
                        userListWithChatID: userListWithChatID,
                        parse_mode: 'false',
                    }).catch((e: any) => {
                        error([
                            { text: 'Error', val: e.message },
                            { text: 'Stack', val: e.stack },
                        ]);
                    });
                },
            );
        }
    } catch (e: any) {
        error([
            { text: 'Error:', val: e.message },
            { text: 'Stack:', val: e.stack },
        ]);
    }
}

export { getChart };
