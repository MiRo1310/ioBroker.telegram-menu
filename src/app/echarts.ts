import { adapter } from '../main';
import { errorLogger } from './logging';
import { sendToTelegram } from './telegram';
import type { Echart, TelegramParams } from '../types/types';
import { validateDirectory } from '../lib/utils';
import { getEchartsValues } from '../lib/splitValues';

export function getChart(
    echarts: Echart[],
    directoryPicture: string,
    user: string,
    telegramParams: TelegramParams,
): void {
    try {
        for (const echart of echarts) {
            const instanceOfEchart = getEchartsValues(echart.preset);

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
                async (result: any) => {
                    const textToSend = result.error || directoryPicture + echart.filename;

                    await sendToTelegram({ userToSend: user, textToSend, telegramParams });
                },
            );
        }
    } catch (e: any) {
        errorLogger('Error in Echart:', e, adapter);
    }
}
