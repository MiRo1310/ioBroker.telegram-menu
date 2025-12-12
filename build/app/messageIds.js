"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageIds = deleteMessageIds;
exports.saveMessageIds = saveMessageIds;
const string_1 = require("../lib/string");
const logging_1 = require("../app/logging");
const utils_1 = require("../lib/utils");
const botAction_1 = require("../app/botAction");
let isDeleting = false;
async function saveMessageIds(adapter, state, instanceTelegram) {
    try {
        let requestMessageId = {};
        const requestMessageIdObj = !isDeleting ? await adapter.getStateAsync('communication.requestIds') : null;
        isDeleting = false;
        const requestUserIdObj = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
        const request = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.request`);
        if (!requestUserIdObj?.val) {
            return;
        }
        let isValidJson = false;
        let json = {};
        if (requestMessageIdObj?.val) {
            const result = (0, string_1.parseJSON)(String(requestMessageIdObj?.val), adapter);
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
        requestMessageId = removeOldMessageIds(requestMessageId, userIDValue);
        await adapter.setState('communication.requestIds', JSON.stringify(requestMessageId), true);
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error saveMessageIds:', e, adapter);
    }
}
function removeOldMessageIds(messages, chatID) {
    messages[chatID] = messages[chatID].filter(message => {
        return message.time && message.time > Date.now() - 1000 * 60 * 60 * 24 * 2;
    });
    return messages;
}
const removeMessageFromList = ({ element, chat_id, copyMessageIds, }) => {
    return copyMessageIds[chat_id].filter(message => message.id !== element.id);
};
async function deleteMessageIds(instance, user, telegramParams, whatShouldDelete) {
    const { userListWithChatID, adapter } = telegramParams;
    try {
        const requestMessageIdObj = await adapter.getStateAsync('communication.requestIds');
        const lastMessageId = await adapter.getForeignStateAsync(`${instance}.communicate.requestMessageId`);
        if (!requestMessageIdObj ||
            typeof requestMessageIdObj.val !== 'string' ||
            !JSON.parse(requestMessageIdObj.val)) {
            return;
        }
        const chat_id = (0, utils_1.getChatID)(userListWithChatID, user);
        const { json, isValidJson } = (0, string_1.parseJSON)(requestMessageIdObj.val);
        if (!isValidJson || !chat_id) {
            return;
        }
        if (lastMessageId && lastMessageId.val) {
            json[chat_id].push({ id: lastMessageId.val.toString() });
        }
        isDeleting = true;
        const copyMessageIds = (0, utils_1.deepCopy)(json, adapter);
        json[chat_id].forEach((element, index) => {
            const id = element.id?.toString();
            if (whatShouldDelete === 'all' && id) {
                (0, botAction_1.deleteMessageByBot)(adapter, instance, user, parseInt(id), chat_id);
            }
            if (whatShouldDelete === 'last' && index === json[chat_id].length - 1 && id) {
                (0, botAction_1.deleteMessageByBot)(adapter, instance, user, parseInt(id), chat_id);
            }
            if (!copyMessageIds) {
                return;
            }
            copyMessageIds[chat_id] = removeMessageFromList({ element, chat_id, copyMessageIds });
        });
        await adapter.setState('communication.requestIds', JSON.stringify(copyMessageIds), true);
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error deleteMessageIds:', e, adapter);
    }
}
//# sourceMappingURL=messageIds.js.map