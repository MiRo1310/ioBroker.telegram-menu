import { adapter } from '../main';
import { errorLogger } from './logging';
import { sendToTelegram } from './telegram';
import type { Echart, UserListWithChatId } from '../types/types';
import { validateDirectory } from '../lib/utils';

function getChart(
    echarts: Echart[],
    directoryPicture: string,
    user: string,
    instanceTelegram: string,
    userListWithChatID: UserListWithChatId[],
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
): void {
    try {
        if (!echarts) {
            return;
        }
        for (const echart of echarts) {
            const splitPreset = echart.preset.split('.');
            const instanceOfEchart = `${splitPreset[0]}.${splitPreset[1]}`;

            if (!validateDirectory(adapter, directoryPicture)) {
                return;
            }
            adapter.sendTo(
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
                        userToSend: user,
                        textToSend: result.error || directoryPicture + echart.filename,
                        telegramInstance: instanceTelegram,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                    }).catch((e: any) => {
                        errorLogger('Error send to telegram: ', e, adapter);
                    });
                },
            );
        }
    } catch (e: any) {
        errorLogger('Error get chart:', e, adapter);
    }
}

export { getChart };
