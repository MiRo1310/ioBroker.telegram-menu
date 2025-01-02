import { sendToTelegram } from './telegram';
import { replaceAll } from './utilities';
import { exec } from 'child_process';
import { debug, error } from './logging';
import TelegramMenu from '../main';
import type { Part, UserListWithChatId, Timeouts } from './telegram-menu';
import { checkDirectoryIsOk } from './global';

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
            const _this = TelegramMenu.getInstance();
            let path = '';
            if (element.id != '-') {
                const url = element.id;
                const newUrl = replaceAll(url, '&amp;', '&');

                exec(
                    `curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${element.fileName}`,
                    (error: any, stdout: any, stderr: any) => {
                        if (stdout) {
                            debug([{ text: 'Stdout:', val: stdout }]);
                        }
                        if (stderr) {
                            debug([{ text: 'Stderr:', val: stderr }]);
                        }
                        if (error) {
                            error([{ text: 'Error:', val: error }]);
                            return;
                        }
                    },
                );

                debug([{ text: 'Delay Time:', val: element.delay }]);
                timeoutKey += 1;

                if (!checkDirectoryIsOk(directoryPicture)) {
                    return;
                }

                path = `${directoryPicture}${element.fileName}`;
                debug([{ text: 'Path : ', val: path }]);
            } else {
                return;
            }

            const timeout = _this.setTimeout(async () => {
                await sendToTelegram(
                    userToSend,
                    path,
                    undefined,
                    instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                    'false',
                );
                let timeoutToClear: Timeouts[] = [];
                timeoutToClear = timeouts.filter(item => item.key == timeoutKey);
                timeoutToClear.forEach(item => {
                    clearTimeout(item.timeout);
                });

                timeouts = timeouts.filter(item => item.key !== timeoutKey);
                debug([{ text: 'Picture sent' }]);
            }, parseInt(element.delay));

            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout: timeout });
            }
        });
        return timeouts;
    } catch (e: any) {
        error([
            { text: 'Error:', val: e.message },
            { text: 'Stack:', val: e.stack },
        ]);
    }
    return timeouts;
}

export { sendPic };
