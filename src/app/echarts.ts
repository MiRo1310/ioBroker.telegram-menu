import { adapter } from '../main';
import { errorLogger } from './logging';
import { sendToTelegram } from './telegram';
import type { Echart, TelegramParams } from '../types/types';
import { validateDirectory } from '../lib/utils';

function getChart(echarts: Echart[], directoryPicture: string, user: string, telegramParams: TelegramParams): void {
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
                    const textToSend = result.error || directoryPicture + echart.filename;

                    sendToTelegram({ userToSend: user, textToSend, telegramParams }).catch((e: any) => {
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
