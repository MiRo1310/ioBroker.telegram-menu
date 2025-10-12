import { validateDirectory } from '@b/lib/utils';
import type { ModifiedEchart, TelegramParams } from '@b/types/types';
import { getEchartsValues } from '@b/lib/splitValues';
import { sendToTelegram } from '@b/app/telegram';
import { errorLogger } from '@b/app/logging';

export function getChart(
    instance: string,
    echarts: ModifiedEchart[],
    directoryPicture: string,
    user: string,
    telegramParams: TelegramParams,
): void {
    const adapter = telegramParams.adapter;
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

                    await sendToTelegram({ instance, userToSend: user, textToSend, telegramParams });
                },
            );
        }
    } catch (e: any) {
        errorLogger('Error in Echart:', e, adapter);
    }
}
