"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessageIds = exports.saveMessageIds = void 0;
const main_1 = __importDefault(require("../../main"));
const botAction_1 = require("./botAction");
const utilities_1 = require("./utilities");
const logging_1 = require("./logging");
let isDeleting = false;
async function saveMessageIds(state, instanceTelegram) {
    const _this = main_1.default.getInstance();
    try {
        let requestMessageId = {};
        (0, logging_1.debug)([{ text: "aa new Value ", val: await _this.getStateAsync("communication.requestIds") }]);
        let requestMessageIdObj = null;
        if (!isDeleting) {
            requestMessageIdObj = await _this.getStateAsync("communication.requestIds");
        }
        isDeleting = false;
        const requestUserIdObj = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);
        const request = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.request`);
        if (!(requestUserIdObj && requestUserIdObj.val)) {
            return;
        }
        requestMessageId = requestMessageIdObj && requestMessageIdObj.val ? JSON.parse(requestMessageIdObj.val.toString()) : {};
        if (!requestMessageId[requestUserIdObj.val.toString()]) {
            requestMessageId[requestUserIdObj.val.toString()] = [];
        }
        if (!requestMessageId[requestUserIdObj.val.toString()]?.find((message) => message.id === state.val)) {
            requestMessageId[requestUserIdObj.val.toString()].push({ id: state.val, time: Date.now(), request: request?.val });
        }
        requestMessageId = removeOldMessageIds(requestMessageId, requestUserIdObj.val.toString());
        (0, logging_1.debug)([{ text: "b new Value ", val: await _this.getStateAsync("communication.requestIds") }]);
        await _this.setStateAsync("communication.requestIds", JSON.stringify(requestMessageId), true);
        (0, logging_1.debug)([{ text: "a new Value ", val: await _this.getStateAsync("communication.requestIds") }]);
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error saveMessageIds:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.saveMessageIds = saveMessageIds;
function removeOldMessageIds(messages, chatID) {
    messages[chatID] = messages[chatID].filter((message) => {
        return message.time && message.time > Date.now() - 1000 * 60 * 60 * 24 * 2;
    });
    return messages;
}
async function deleteMessageIds(user, userListWithChatID, instanceTelegram, whatShouldDelete) {
    const _this = main_1.default.getInstance();
    try {
        const requestMessageIdObj = await _this.getStateAsync("communication.requestIds");
        const lastMessageId = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);
        if (requestMessageIdObj && typeof requestMessageIdObj.val === "string" && JSON.parse(requestMessageIdObj.val)) {
            const chat_id = (0, utilities_1.getChatID)(userListWithChatID, user);
            const messageIds = JSON.parse(requestMessageIdObj.val);
            if (lastMessageId && lastMessageId.val) {
                messageIds[chat_id].push({ id: lastMessageId.val.toString() });
            }
            isDeleting = true;
            messageIds[chat_id].forEach((element) => {
                if (whatShouldDelete === "all" && element.id) {
                    (0, botAction_1.deleteMessageByBot)(instanceTelegram, user, userListWithChatID, parseInt(element.id?.toString()), chat_id);
                }
            });
            messageIds[chat_id] = [];
            (0, logging_1.debug)([{ text: "before Save", val: messageIds }]);
            await _this.setStateAsync("communication.requestIds", JSON.stringify(messageIds), true);
            (0, logging_1.debug)([{ text: "After Save", val: messageIds }]);
        }
    }
    catch (e) {
        (0, logging_1.error)([
            { text: "Error deleteMessageIds:", val: e.message },
            { text: "Stack:", val: e.stack },
        ]);
    }
}
exports.deleteMessageIds = deleteMessageIds;
//# sourceMappingURL=messageIds.js.map