import { sendToTelegram } from './telegram';
import { validateDirectory } from '../lib/utils';
import { exec } from 'child_process';
import { errorLogger } from './logging';
import { adapter } from '../main';
import type { Part, Timeouts, UserListWithChatId } from '../types/types';
import { replaceAll } from '../lib/string';

function sendPic(
    part: Part,
    userToSend: string,
    instanceTelegram: string,
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
    token: string,
    directoryPicture: string,
    timeouts: Timeouts[],
    timeoutKey: string,
): Timeouts[] {
    try {
        part.sendPic?.forEach(element => {
            const { id, delay, fileName } = element;
            let path = '';
            if (id != '-') {
                const newUrl = replaceAll(id, '&amp;', '&');

                exec(
                    `curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${fileName}`,
                    (error: any, stdout: any, stderr: any) => {
                        if (stdout) {
                            adapter.log.debug(`Stdout: ${stdout}`);
                        }
                        if (stderr) {
                            adapter.log.debug(`Stderr: ${stderr}`);
                        }
                        if (error) {
                            errorLogger('Error in exec:', error, adapter);

                            return;
                        }
                    },
                );

                adapter.log.debug(`Delay Time: ${delay}`);
                timeoutKey += 1;

                if (!validateDirectory(adapter, directoryPicture)) {
                    return;
                }

                path = `${directoryPicture}${fileName}`;
                adapter.log.debug(`Path: ${path}`);
            } else {
                return;
            }

            const timeout = adapter.setTimeout(
                async () => {
                    await sendToTelegram({
                        userToSend,
                        textToSend: path,
                        telegramInstance: instanceTelegram,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                    });
                    let timeoutToClear: Timeouts[] = [];
                    timeoutToClear = timeouts.filter(item => item.key == timeoutKey);
                    timeoutToClear.forEach(item => {
                        adapter.clearTimeout(item.timeout);
                    });

                    timeouts = timeouts.filter(item => item.key !== timeoutKey);

                    adapter.log.debug('Picture sent');
                },
                parseInt(String(element.delay)),
            );

            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout: timeout });
            }
        });
        return timeouts;
    } catch (e: any) {
        errorLogger('Error send pic:', e, adapter);
    }
    return timeouts;
}

export { sendPic };
