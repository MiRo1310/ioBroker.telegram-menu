import { validateDirectory } from '@backend/lib/utils';
import type { ModifiedEchart } from '@backend/types/types';
import { getEchartsValues } from '@backend/lib/splitValues';
import { sendToTelegram } from '@backend/app/telegram';
import { errorLogger } from '@backend/app/logging';
import type { AppContext } from '@backend/app/appContext';

export function getChart(instance: string, echarts: ModifiedEchart[], user: string, appContext: AppContext): void {
    try {
        for (const echart of echarts) {
            const instanceOfEchart = getEchartsValues(echart.preset);
            if (!instanceOfEchart) {
                appContext.adapter.log.warn('Echart Instance not found');
                return;
            }
            if (!validateDirectory(appContext)) {
                return;
            }
            const targetInstance = echart.echartsInstance || instanceOfEchart;
            appContext.adapter.sendTo(
                targetInstance,
                'send',
                {
                    preset: echart.preset,
                    renderer: 'jpg',
                    background: echart.background,
                    theme: echart.theme,
                    quality: 1.0,
                    fileOnDisk: appContext.directoryPicture + echart.filename,
                },
                async (result: any) => {
                    const textToSend = result.error || appContext.directoryPicture + echart.filename;

                    await sendToTelegram({ instance, userToSend: user, textToSend, appContext });
                },
            );
        }
    } catch (e: any) {
        errorLogger('Error in Echart:', e, appContext.adapter);
    }
}
