"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPic = sendPic;
const appUtils_1 = require("../lib/appUtils");
const string_1 = require("../lib/string");
const utils_1 = require("../lib/utils");
const exec_1 = require("../app/exec");
const telegram_1 = require("../app/telegram");
function sendPic(appContext, instance, part, userToSend, timeouts, timeoutKey) {
    part.sendPic?.forEach((element, index) => {
        const { id, delay, fileName } = element;
        let path = '';
        if (!(0, appUtils_1.isStartside)(id)) {
            return;
        }
        const url = (0, string_1.replaceAll)(id, '&amp;', '&');
        path = `${appContext.directoryPicture}${fileName}`;
        if (!(0, utils_1.validateDirectory)(appContext)) {
            return;
        }
        if (delay <= 0) {
            (0, exec_1.loadWithCurl)(appContext, path, url, async () => await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: path,
                appContext,
            }));
            return;
        }
        (0, exec_1.loadWithCurl)(appContext, path, url);
        timeoutKey += index;
        const timeout = appContext.adapter.setTimeout(async () => {
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: path,
                appContext,
            });
            const timeoutToClear = timeouts.find(item => item.key == timeoutKey);
            appContext.adapter.clearTimeout(timeoutToClear?.timeout);
            timeouts = timeouts.filter(item => item.key !== timeoutKey);
            appContext.adapter.log.debug(`Picture has been send with delay ${delay}, path : ${path}`);
        }, parseInt(String(element.delay)));
        if (timeout) {
            timeouts.push({ key: timeoutKey, timeout });
        }
    });
    return timeouts;
}
//# sourceMappingURL=sendpic.js.map