"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageIds = deleteMessageIds;
exports.saveMessageIds = saveMessageIds;
const main_1 = require("../main");
const botAction_1 = require("./botAction");
const logging_1 = require("./logging");
const utils_1 = require("../lib/utils");
const string_1 = require("../lib/string");
let isDeleting = false;
async function saveMessageIds(state, instanceTelegram) {
    try {
        let requestMessageId = {};
        let requestMessageIdObj = null;
        if (!isDeleting) {
            requestMessageIdObj = await main_1.adapter.getStateAsync('communication.requestIds');
        }
        isDeleting = false;
        const requestUserIdObj = await main_1.adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
        const request = await main_1.adapter.getForeignStateAsync(`${instanceTelegram}.communicate.request`);
        if (!(requestUserIdObj && requestUserIdObj.val)) {
            return;
        }
        requestMessageId = requestMessageIdObj?.val ? JSON.parse(requestMessageIdObj?.val.toString()) : {};
        if (!requestMessageId[requestUserIdObj.val.toString()]) {
            requestMessageId[requestUserIdObj.val.toString()] = [];
        }
        if (!requestMessageId[requestUserIdObj.val.toString()]?.find(message => message.id === state.val)) {
            requestMessageId[requestUserIdObj.val.toString()].push({
                id: state.val,
                time: Date.now(),
                request: request?.val,
            });
        }
        requestMessageId = removeOldMessageIds(requestMessageId, requestUserIdObj.val.toString());
        await main_1.adapter.setState('communication.requestIds', JSON.stringify(requestMessageId), true);
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error saveMessageIds:', e, main_1.adapter);
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
async function deleteMessageIds(user, userListWithChatID, instanceTelegram, whatShouldDelete) {
    try {
        const requestMessageIdObj = await main_1.adapter.getStateAsync('communication.requestIds');
        const lastMessageId = await main_1.adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);
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
        const copyMessageIds = (0, utils_1.deepCopy)(json, main_1.adapter);
        json[chat_id].forEach((element, index) => {
            const id = element.id?.toString();
            if (whatShouldDelete === 'all' && id) {
                (0, botAction_1.deleteMessageByBot)(instanceTelegram, user, parseInt(id), chat_id);
            }
            if (whatShouldDelete === 'last' && index === json[chat_id].length - 1 && id) {
                (0, botAction_1.deleteMessageByBot)(instanceTelegram, user, parseInt(id), chat_id);
            }
            if (!copyMessageIds) {
                return;
            }
            copyMessageIds[chat_id] = removeMessageFromList({ element, chat_id, copyMessageIds });
        });
        await main_1.adapter.setState('communication.requestIds', JSON.stringify(copyMessageIds), true);
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error deleteMessageIds:', e, main_1.adapter);
    }
}
//# sourceMappingURL=messageIds.js.map