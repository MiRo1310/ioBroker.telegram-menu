"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPic = sendPic;
const telegram_1 = require("./telegram");
const utils_1 = require("../lib/utils");
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
                path = `${directoryPicture}${fileName}`;
                (0, child_process_1.exec)(`curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${path}`, (error, stdout, stderr) => {
                    if (stdout) {
                        main_1.adapter.log.debug(`Stdout: ${stdout}`);
                    }
                    if (stderr) {
                        main_1.adapter.log.debug(`Stderr: ${stderr}`);
                    }
                    if (error) {
                        (0, logging_1.errorLogger)('Error in exec:', error, main_1.adapter);
                        return;
                    }
                });
                main_1.adapter.log.debug(`Delay Time: ${delay}`);
                timeoutKey += 1;
                if (!(0, utils_1.validateDirectory)(main_1.adapter, directoryPicture)) {
                    return;
                }
                main_1.adapter.log.debug(`Path: ${path}`);
            }
            else {
                return;
            }
            const timeout = main_1.adapter.setTimeout(async () => {
                await (0, telegram_1.sendToTelegram)({
                    userToSend,
                    textToSend: path,
                    telegramInstance: instanceTelegram,
                    resize_keyboard,
                    one_time_keyboard,
                    userListWithChatID,
                });
                let timeoutToClear = [];
                timeoutToClear = timeouts.filter(item => item.key == timeoutKey);
                timeoutToClear.forEach(item => {
                    main_1.adapter.clearTimeout(item.timeout);
                });
                timeouts = timeouts.filter(item => item.key !== timeoutKey);
                main_1.adapter.log.debug('Picture sent');
            }, parseInt(String(element.delay)));
            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout: timeout });
            }
        });
        return timeouts;
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error send pic:', e, main_1.adapter);
    }
    return timeouts;
}
//# sourceMappingURL=sendpic.js.map