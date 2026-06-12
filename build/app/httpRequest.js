"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpRequest = httpRequest;
const axios_1 = __importDefault(require("axios"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const utils_1 = require("../lib/utils");
const telegram_1 = require("../app/telegram");
const logging_1 = require("../app/logging");
async function httpRequest(appContext, instance, parts, userToSend) {
    if (!parts.httpRequest?.length) {
        return false;
    }
    for (const { url, password, user: username, filename } of parts.httpRequest) {
        if (!url) {
            return false;
        }
        appContext.adapter.log.debug(`URL : ${url}`);
        try {
            //prettier-ignore
            const response = await (0, axios_1.default)(username && password
                ? {
                    method: 'get',
                    url,
                    responseType: 'arraybuffer',
                    auth: {
                        username,
                        password,
                    },
                }
                : {
                    method: 'get',
                    url,
                    responseType: 'arraybuffer',
                });
            if (!(0, utils_1.validateDirectory)(appContext)) {
                return false;
            }
            const imagePath = node_path_1.default.join(appContext.directoryPicture, filename);
            node_fs_1.default.writeFileSync(imagePath, Buffer.from(response.data), 'binary');
            appContext.adapter.log.debug(`Pic saved : ${imagePath}`);
            await (0, telegram_1.sendToTelegram)({
                instance,
                userToSend,
                textToSend: imagePath,
                appContext,
            });
        }
        catch (e) {
            (0, logging_1.errorLogger)('Error http request:', e, appContext.adapter);
        }
    }
    return true;
}
//# sourceMappingURL=httpRequest.js.map