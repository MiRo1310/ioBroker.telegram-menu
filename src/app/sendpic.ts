import { sendToTelegram } from './telegram';
import { validateDirectory } from '../lib/utils';
import { errorLogger } from './logging';
import type { Part, TelegramParams, Timeouts } from '../types/types';
import { replaceAll } from '../lib/string';
import { isStartside } from '../lib/appUtils';
import { loadWithCurl } from './exec';

export function sendPic(
    instance: string,
    part: Part,
    userToSend: string,
    telegramParams: TelegramParams,
    token: string,
    directoryPicture: string,
    timeouts: Timeouts[],
    timeoutKey: string,
): Timeouts[] {
    const adapter = telegramParams.adapter;
    try {
        part.sendPic?.forEach((element, index) => {
            const { id, delay, fileName } = element;
            let path = '';
            if (!isStartside(id)) {
                return;
            }
            const url = replaceAll(id, '&amp;', '&');
            path = `${directoryPicture}${fileName}`;

            if (!validateDirectory(adapter, directoryPicture)) {
                return;
            }

            if (delay <= 0) {
                loadWithCurl(
                    adapter,
                    token,
                    path,
                    url,
                    async () =>
                        await sendToTelegram({
                            instance,
                            userToSend,
                            textToSend: path,
                            telegramParams,
                        }),
                );
                return;
            }
            loadWithCurl(adapter, token, path, url);
            timeoutKey += index;

            const timeout = adapter.setTimeout(
                async () => {
                    await sendToTelegram({
                        instance,
                        userToSend,
                        textToSend: path,
                        telegramParams,
                    });
                    let timeoutToClear: Timeouts | undefined = undefined;
                    timeoutToClear = timeouts.find(item => item.key == timeoutKey);

                    adapter.clearTimeout(timeoutToClear?.timeout);
                    timeouts = timeouts.filter(item => item.key !== timeoutKey);

                    adapter.log.debug(`Picture has been send with delay ${delay}, path : ${path}`);
                },
                parseInt(String(element.delay)),
            );

            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout });
            }
        });
        return timeouts;
    } catch (e: any) {
        errorLogger('Error send pic:', e, adapter);
    }
    return timeouts;
}
