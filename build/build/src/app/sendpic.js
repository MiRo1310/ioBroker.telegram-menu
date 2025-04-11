"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPic = sendPic;
const telegram_1 = require("./telegram");
const global_1 = require("./global");
const child_process_1 = require("child_process");
const logging_1 = require("./logging");
const main_1 = require("../main");
const string_1 = require("../lib/string");
function sendPic(part, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, token, directoryPicture, timeouts, timeoutKey) {
    try {
        part.sendPic?.forEach(element => {
            const { id, delay, fileName } = element;
            let path = '';
            if (id != '-') {
                const newUrl = (0, string_1.replaceAll)(id, '&amp;', '&');
                (0, child_process_1.exec)(`curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${fileName}`, (error, stdout, stderr) => {
                    if (stdout) {
                        main_1._this.log.debug(`Stdout: ${stdout}`);
                    }
                    if (stderr) {
                        main_1._this.log.debug(`Stderr: ${stderr}`);
                    }
                    if (error) {
                        (0, logging_1.errorLogger)('Error in exec:', error);
                        return;
                    }
                });
                main_1._this.log.debug(`Delay Time: ${delay}`);
                timeoutKey += 1;
                if (!(0, global_1.checkDirectoryIsOk)(directoryPicture)) {
                    return;
                }
                path = `${directoryPicture}${fileName}`;
                main_1._this.log.debug(`Path: ${path}`);
            }
            else {
                return;
            }
            const timeout = main_1._this.setTimeout(async () => {
                await (0, telegram_1.sendToTelegram)({
                    user: userToSend,
                    textToSend: path,
                    instance: instanceTelegram,
                    resize_keyboard: resize_keyboard,
                    one_time_keyboard: one_time_keyboard,
                    userListWithChatID: userListWithChatID,
                    parse_mode: 'false',
                });
                let timeoutToClear = [];
                timeoutToClear = timeouts.filter(item => item.key == timeoutKey);
                timeoutToClear.forEach(item => {
                    main_1._this.clearTimeout(item.timeout);
                });
                timeouts = timeouts.filter(item => item.key !== timeoutKey);
                main_1._this.log.debug('Picture sent');
            }, parseInt(String(element.delay)));
            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout: timeout });
            }
        });
        return timeouts;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error send pic:', e);
    }
    return timeouts;
}
