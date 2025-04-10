import { sendToTelegram } from './telegram';
import { checkDirectoryIsOk, replaceAll } from './global';
import { exec } from 'child_process';
import { errorLogger } from './logging';
import { _this } from '../main';
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
            const { id, delay, fileName } = element;
            let path = '';
            if (id != '-') {
                const newUrl = replaceAll(id, '&amp;', '&');

                exec(
                    `curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${fileName}`,
                    (error: any, stdout: any, stderr: any) => {
                        if (stdout) {
                            _this.log.debug(`Stdout: ${stdout}`);
                        }
                        if (stderr) {
                            _this.log.debug(`Stderr: ${stderr}`);
                        }
                        if (error) {
                            errorLogger('Error in exec:', error);

                            return;
                        }
                    },
                );

                _this.log.debug(`Delay Time: ${delay}`);
                timeoutKey += 1;

                if (!checkDirectoryIsOk(directoryPicture)) {
                    return;
                }

                path = `${directoryPicture}${fileName}`;
                _this.log.debug(`Path: ${path}`);
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

                    _this.log.debug('Picture sent');
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
