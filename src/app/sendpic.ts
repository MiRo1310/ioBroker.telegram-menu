import type { Part, Timeouts } from '@backend/types/types';
import { isStartside } from '@backend/lib/appUtils';
import { replaceAll } from '@backend/lib/string';
import { validateDirectory } from '@backend/lib/utils';
import { loadWithCurl } from '@backend/app/exec';
import { sendToTelegram } from '@backend/app/telegram';
import { errorLogger } from '@backend/app/logging';
import type { AppContext } from '@backend/app/appContext';

export function sendPic(
    appContext: AppContext,
    instance: string,
    part: Part,
    userToSend: string,
    timeouts: Timeouts[],
    timeoutKey: string,
): Timeouts[] {
    try {
        part.sendPic?.forEach((element, index) => {
            const { id, delay, fileName } = element;
            let path = '';
            if (!isStartside(id)) {
                return;
            }
            const url = replaceAll(id, '&amp;', '&');
            path = `${appContext.directoryPicture}${fileName}`;

            if (!validateDirectory(appContext)) {
                return;
            }

            if (delay <= 0) {
                loadWithCurl(
                    appContext,
                    path,
                    url,
                    async () =>
                        await sendToTelegram({
                            instance,
                            userToSend,
                            textToSend: path,
                            appContext,
                        }),
                );
                return;
            }
            loadWithCurl(appContext, path, url);
            timeoutKey += index;

            const timeout = appContext.adapter.setTimeout(
                async () => {
                    await sendToTelegram({
                        instance,
                        userToSend,
                        textToSend: path,
                        appContext,
                    });

                    const timeoutToClear = timeouts.find(item => item.key == timeoutKey);

                    appContext.adapter.clearTimeout(timeoutToClear?.timeout);
                    timeouts = timeouts.filter(item => item.key !== timeoutKey);

                    appContext.adapter.log.debug(`Picture has been send with delay ${delay}, path : ${path}`);
                },
                parseInt(String(element.delay)),
            );

            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout });
            }
        });
        return timeouts;
    } catch (e: any) {
        errorLogger('Error send pic:', e, appContext.adapter);
    }
    return timeouts;
}
