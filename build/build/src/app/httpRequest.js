"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequest = httpRequest;
const axios_1 = __importDefault(require("axios"));
const telegram_1 = require("./telegram");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logging_1 = require("./logging");
const global_1 = require("./global");
const main_1 = require("../main");
async function httpRequest(parts, userToSend, instanceTelegram, resize_keyboard, one_time_keyboard, userListWithChatID, directoryPicture) {
    if (!parts.httpRequest) {
        return;
    }
    for (const part of parts.httpRequest) {
        const { url, password, user } = part;
        const method = 'get';
        main_1._this.log.debug(`URL: ${url}`);
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
            if (!(0, global_1.checkDirectoryIsOk)(directoryPicture)) {
                return;
            }
            const imagePath = path_1.default.join(directoryPicture, part.filename);
            fs_1.default.writeFileSync(imagePath, Buffer.from(response.data), 'binary');
            main_1._this.log.debug(`Pic saved: ${imagePath}`);
            await (0, telegram_1.sendToTelegram)({
                user: userToSend,
                textToSend: imagePath,
                instance: instanceTelegram,
                resize_keyboard: resize_keyboard,
                one_time_keyboard: one_time_keyboard,
                userListWithChatID: userListWithChatID,
                parse_mode: 'false',
            });
        }
        catch (e) {
            (0, logging_1.errorLogger)('Error http request:', e);
        }
    }
    return true;
}
