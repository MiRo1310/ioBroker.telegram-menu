import { sendToTelegram } from './telegram';
import { validateDirectory } from '../lib/utils';
import { exec } from 'child_process';
import { errorLogger } from './logging';
import { adapter } from '../main';
import type { Part, TelegramParams, Timeouts } from '../types/types';
import { replaceAll } from '../lib/string';
import { isStartside } from '../lib/appUtils';

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
    try {
        part.sendPic?.forEach(element => {
            const { id, delay, fileName } = element;
            let path = '';
            if (isStartside(id)) {
                const url = replaceAll(id, '&amp;', '&');
                path = `${directoryPicture}${fileName}`;

                exec(
                    `curl -H "Authorization: Bearer ${token.trim()}" "${url}" > ${path}`,
                    (error: any, stdout: any, stderr: any) => {
                        if (stdout) {
                            adapter.log.debug(`Stdout : "${stdout}"`);
                        }
                        if (stderr) {
                            adapter.log.debug(`Stderr : "${stderr}"`);
                        }
                        if (error) {
                            errorLogger('Error in exec:', error, adapter);
                            return;
                        }
                    },
                );

                adapter.log.debug(`Send Picture : { delay : ${delay} , path : ${path} }`);
                timeoutKey += 1;

                if (!validateDirectory(adapter, directoryPicture)) {
                    return;
                }
            } else {
                return;
            }

            const timeout = adapter.setTimeout(
                async () => {
                    await sendToTelegram({
                        instance,
                        userToSend,
                        textToSend: path,
                        telegramParams,
                    });
                    let timeoutToClear: Timeouts[] = [];
                    timeoutToClear = timeouts.filter(item => item.key == timeoutKey);
                    timeoutToClear.forEach(item => {
                        adapter.clearTimeout(item.timeout);
                    });

                    timeouts = timeouts.filter(item => item.key !== timeoutKey);

                    adapter.log.debug('Picture has been send');
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
