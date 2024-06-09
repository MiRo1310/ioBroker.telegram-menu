"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPic = void 0;
const telegram_1 = require("./telegram");
const utilities_1 = require("./utilities");
const child_process_1 = require("child_process");
const logging_1 = require("./logging");
const main_1 = __importDefault(require("../../main"));
function sendPic(part, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, token, directoryPicture, timeouts, timeoutKey) {
    part.sendPic?.forEach((element) => {
        const _this = main_1.default.getInstance();
        let path = "";
        if (element.id != "-") {
            const url = element.id;
            const newUrl = (0, utilities_1.replaceAll)(url, "&amp;", "&");
            try {
                (0, child_process_1.exec)(`curl -H "Autorisation: Bearer ${token.trim()}" "${newUrl}" > ${directoryPicture}${element.fileName}`, (error, stdout, stderr) => {
                    if (stdout) {
                        (0, logging_1.debug)([{ text: "Stdout:", val: stdout }]);
                    }
                    if (stderr) {
                        (0, logging_1.debug)([{ text: "Stderr:", val: stderr }]);
                    }
                    if (error) {
                        error([{ text: "Error:", val: error }]);
                        return;
                    }
                });
            }
            catch (e) {
                (0, logging_1.error)([
                    { text: "Error:", val: e.message },
                    { text: "Stack:", val: e.stack },
                ]);
            }
            (0, logging_1.debug)([{ text: "Delay Time:", val: element.delay }]);
            timeoutKey += 1;
            path = `${directoryPicture}${element.fileName}`;
            return;
        }
        try {
            path = element.fileName;
            const timeout = _this.setTimeout(async () => {
                (0, telegram_1.sendToTelegram)(userToSend, path, undefined, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
                let timeoutToClear = [];
                timeoutToClear = timeouts.filter((item) => item.key == timeoutKey);
                timeoutToClear.forEach((item) => {
                    clearTimeout(item.timeout);
                });
                timeouts = timeouts.filter((item) => item.key !== timeoutKey);
            }, parseInt(element.delay));
            if (timeout) {
                timeouts.push({ key: timeoutKey, timeout: timeout });
            }
        }
        catch (e) {
            (0, logging_1.error)([
                { text: "Error:", val: e.message },
                { text: "Stack:", val: e.stack },
            ]);
        }
    });
    (0, logging_1.debug)([{ text: "Picture sended" }]);
    return timeouts;
}
exports.sendPic = sendPic;
//# sourceMappingURL=sendpic.js.map