"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageIds = exports.saveMessageIds = exports.messageIdManager = void 0;
const string_1 = require("../lib/string");
const utils_1 = require("../lib/utils");
const botAction_1 = require("../app/botAction");
class MessageIdManager {
    isDeleting = false;
    async saveMessageIds(adapter, state, instanceTelegram) {
        let requestMessageId = {};
        const requestMessageIdObj = !this.isDeleting ? await adapter.getStateAsync('communication.requestIds') : null;
        this.isDeleting = false;
        const requestUserIdObj = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
        const request = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.request`);
        if (!requestUserIdObj?.val) {
            return;
        }
        let isValidJson = false;
        let json = {};
        if (requestMessageIdObj?.val) {
            const result = (0, string_1.parseJSON)(String(requestMessageIdObj?.val), adapter);
            /* istanbul ignore next */
            json = result.json ?? {};
            isValidJson = result.isValidJson;
        }
        requestMessageId = isValidJson ? json : {};
        const userIDValue = requestUserIdObj.val.toString();
        if (requestMessageId && !requestMessageId[userIDValue]) {
            requestMessageId[userIDValue] = [];
        }
        if (!requestMessageId[userIDValue].find(message => message.id === state.val)) {
            requestMessageId[userIDValue].push({
                id: state.val,
                time: Date.now(),
                request: request?.val,
            });
        }
        requestMessageId = this.removeOldMessageIds(requestMessageId, userIDValue);
        await adapter.setState('communication.requestIds', JSON.stringify(requestMessageId), true);
    }
    async deleteMessageIds(instance, user, appContext, whatShouldDelete) {
        const requestMessageIdObj = await appContext.adapter.getStateAsync('communication.requestIds');
        const lastMessageId = await appContext.adapter.getForeignStateAsync(`${instance}.communicate.requestMessageId`);
        if (!requestMessageIdObj ||
            typeof requestMessageIdObj.val !== 'string' ||
            !JSON.parse(requestMessageIdObj.val)) {
            return;
        }
        const chat_id = (0, utils_1.getChatID)(appContext.userListWithChatID, user);
        const { json, isValidJson } = (0, string_1.parseJSON)(requestMessageIdObj.val);
        if (!isValidJson || !chat_id) {
            return;
        }
        if (lastMessageId && lastMessageId.val) {
            json[chat_id].push({ id: lastMessageId.val.toString() });
        }
        this.isDeleting = true;
        const copyMessageIds = (0, utils_1.deepCopy)(json, appContext.adapter);
        json[chat_id].forEach((element, index) => {
            const id = element.id?.toString();
            if (whatShouldDelete === 'all' && id) {
                (0, botAction_1.deleteMessageByBot)(appContext.adapter, instance, user, parseInt(id), chat_id);
            }
            if (whatShouldDelete === 'last' && index === json[chat_id].length - 1 && id) {
                (0, botAction_1.deleteMessageByBot)(appContext.adapter, instance, user, parseInt(id), chat_id);
            }
            /* istanbul ignore next */
            if (!copyMessageIds) {
                return;
            }
            copyMessageIds[chat_id] = this.removeMessageFromList({ element, chat_id, copyMessageIds });
        });
        await appContext.adapter.setState('communication.requestIds', JSON.stringify(copyMessageIds), true);
    }
    removeOldMessageIds(messages, chatID) {
        messages[chatID] = messages[chatID].filter(message => {
            return message.time && message.time > Date.now() - 1000 * 60 * 60 * 24 * 2;
        });
        return messages;
    }
    removeMessageFromList = ({ element, chat_id, copyMessageIds, }) => {
        return copyMessageIds[chat_id].filter(message => message.id !== element.id);
    };
}
exports.messageIdManager = new MessageIdManager();
exports.saveMessageIds = exports.messageIdManager.saveMessageIds.bind(exports.messageIdManager);
exports.deleteMessageIds = exports.messageIdManager.deleteMessageIds.bind(exports.messageIdManager);
//# sourceMappingURL=messageIds.js.map