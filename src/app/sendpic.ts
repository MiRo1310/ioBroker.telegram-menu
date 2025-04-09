import { sendToTelegram } from './telegram';
import { checkDirectoryIsOk, replaceAll } from './global';
import { exec } from 'child_process';
import { debug, errorLogger } from './logging';
import TelegramMenu from '../main';
import type { Part, UserListWithChatId } from '../types/types';

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

            const timeout = _this.setTimeout(
                async () => {
                    await sendToTelegram({
                        user: userToSend,
                        textToSend: path,
                        instance: instanceTelegram,
                        resize_keyboard: resize_keyboard,
                        one_time_keyboard: one_time_keyboard,
                        userListWithChatID: userListWithChatID,
                        parse_mode: 'false',
                    });
                    let timeoutToClear: Timeouts[] = [];
                    timeoutToClear = timeouts.filter(item => item.key == timeoutKey);
                    timeoutToClear.forEach(item => {
                        _this.clearTimeout(item.timeout);
                    });

                    timeouts = timeouts.filter(item => item.key !== timeoutKey);
                    debug([{ text: 'Picture sent' }]);
                },
                parseInt(String(element.delay)),
            );

            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout: timeout });
            }
        });
        return timeouts;
    } catch (e: any) {
        errorLogger('Error send pic:', e);
    }
    return timeouts;
}

export { sendPic };
