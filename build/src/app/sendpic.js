"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPic = sendPic;
const telegram_1 = require("./telegram");
const utils_1 = require("../lib/utils");
const logging_1 = require("./logging");
const main_1 = require("../main");
const string_1 = require("../lib/string");
const appUtils_1 = require("../lib/appUtils");
const exec_1 = require("./exec");
function sendPic(instance, part, userToSend, telegramParams, token, directoryPicture, timeouts, timeoutKey) {
    try {
        part.sendPic?.forEach((element, index) => {
            const { id, delay, fileName } = element;
            let path = '';
            if (!(0, appUtils_1.isStartside)(id)) {
                return;
            }
            const url = (0, string_1.replaceAll)(id, '&amp;', '&');
            path = `${directoryPicture}${fileName}`;
            if (!(0, utils_1.validateDirectory)(main_1.adapter, directoryPicture)) {
                return;
            }
            if (delay <= 0) {
                (0, exec_1.loadWithCurl)(main_1.adapter, token, path, url, async () => await (0, telegram_1.sendToTelegram)({
                    instance,
                    userToSend,
                    textToSend: path,
                    telegramParams,
                }));
                return;
            }
            (0, exec_1.loadWithCurl)(main_1.adapter, token, path, url);
            timeoutKey += index;
            const timeout = main_1.adapter.setTimeout(async () => {
                await (0, telegram_1.sendToTelegram)({
                    instance,
                    userToSend,
                    textToSend: path,
                    telegramParams,
                });
                let timeoutToClear = undefined;
                timeoutToClear = timeouts.find(item => item.key == timeoutKey);
                main_1.adapter.clearTimeout(timeoutToClear?.timeout);
                timeouts = timeouts.filter(item => item.key !== timeoutKey);
                main_1.adapter.log.debug(`Picture has been send with delay ${delay}, path : ${path}`);
            }, parseInt(String(element.delay)));
            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout });
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