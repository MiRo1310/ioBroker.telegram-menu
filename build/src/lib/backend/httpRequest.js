"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const telegram_1 = require("./telegram");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logging_1 = require("./logging");
async function httpRequest(parts, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture) {
    if (!parts.httpRequest) {
        return;
    }
    for (const part of parts.httpRequest) {
        const url = part.url;
        const user = part.user;
        const password = part.password;
        const method = "get";
        try {
            //prettier-ignore
            const response = await (0, axios_1.default)(user && password
                ? {
                    method: method,
                    url: url,
                    responseType: "arraybuffer",
                    auth: {
                        username: user,
                        password: password,
                    },
                }
                : {
                    method: method,
                    url: url,
                    responseType: "arraybuffer",
                });
            if (!part.filename) {
                return;
            }
            const imagePath = path_1.default.join(directoryPicture, part.filename);
            fs_1.default.writeFileSync(imagePath, Buffer.from(response.data), "binary");
            (0, logging_1.debug)([{ text: "Pic saved:", val: imagePath }]);
            (0, telegram_1.sendToTelegram)(user, imagePath, [], instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, "");
        }
        catch (e) {
            (0, logging_1.error)([
                { text: "Error:", val: e.message },
                { text: "Stack:", val: e.stack },
                { text: "Server Response:", val: e.response.status },
                { text: "Server data:", val: e.response.data },
            ]);
        }
    }
    return true;
}
exports.httpRequest = httpRequest;
//# sourceMappingURL=httpRequest.js.map