import TelegramMenu from '../main';
import { deleteMessageByBot } from './botAction';
import { error } from './logging';
import type { UserListWithChatId, WhatShouldDelete } from './telegram-menu';
import { getChatID } from './utilities';

interface Messages {
    [key: string]: MessageInfos[];
}
interface MessageInfos {
    id: ioBroker.StateValue;
    time?: number;
    request?: ioBroker.StateValue | null | undefined;
}
let isDeleting = false;
async function saveMessageIds(state: ioBroker.State, instanceTelegram: string): Promise<void> {
    const _this = TelegramMenu.getInstance();
    try {
        let requestMessageId: Messages = {};
        let requestMessageIdObj: ioBroker.State | null | undefined = null;
        if (!isDeleting) {
            requestMessageIdObj = await _this.getStateAsync('communication.requestIds');
        }
        isDeleting = false;
        const requestUserIdObj = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);

        const request = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.request`);

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
        await _this.setState('communication.requestIds', JSON.stringify(requestMessageId), true);
    } catch (e: any) {
        error([
            { text: 'Error saveMessageIds:', val: e.message },
            { text: 'Stack:', val: e.stack },
        ]);
    }
}
function removeOldMessageIds(messages: Messages, chatID: string): Messages {
    messages[chatID] = messages[chatID].filter(message => {
        return message.time && message.time > Date.now() - 1000 * 60 * 60 * 24 * 2;
    });
    return messages;
}

const removeMessageFromList = ({
    element,
    chat_id,
    copyMessageIds,
}: {
    element: any;
    chat_id: string;
    copyMessageIds: Messages;
}): MessageInfos[] => {
    return copyMessageIds[chat_id].filter(message => message.id !== element.id);
};

async function deleteMessageIds(
    user: string,
    userListWithChatID: UserListWithChatId[],
    instanceTelegram: string,
    whatShouldDelete: WhatShouldDelete,
): Promise<void> {
    const _this = TelegramMenu.getInstance();
    try {
        const requestMessageIdObj = await _this.getStateAsync('communication.requestIds');
        const lastMessageId = await _this.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);

        if (
            !requestMessageIdObj ||
            typeof requestMessageIdObj.val !== 'string' ||
            !JSON.parse(requestMessageIdObj.val)
        ) {
            return;
        }

        const chat_id = getChatID(userListWithChatID, user);
        const messageIds: Messages = JSON.parse(requestMessageIdObj.val);

        if (lastMessageId && lastMessageId.val) {
            messageIds[chat_id].push({ id: lastMessageId.val.toString() });
        }

        isDeleting = true;
        const copyMessageIds = JSON.parse(JSON.stringify(messageIds));
        messageIds[chat_id].forEach((element, index) => {
            if (whatShouldDelete === 'all' && element.id) {
                deleteMessageByBot(
                    instanceTelegram,
                    user,
                    userListWithChatID,
                    parseInt(element.id?.toString()),
                    chat_id,
                ).catch((e: any) => {
                    error([
                        { text: 'Error', val: e.message },
                        { text: 'Stack', val: e.stack },
                    ]);
                });
            }
            if (whatShouldDelete === 'last' && index === messageIds[chat_id].length - 1 && element.id) {
                deleteMessageByBot(
                    instanceTelegram,
                    user,
                    userListWithChatID,
                    parseInt(element.id?.toString()),
                    chat_id,
                ).catch((e: any) => {
                    error([
                        { text: 'Error', val: e.message },
                        { text: 'Stack', val: e.stack },
                    ]);
                });
            }
            copyMessageIds[chat_id] = removeMessageFromList({ element, chat_id, copyMessageIds });
        });

        await _this.setState('communication.requestIds', JSON.stringify(copyMessageIds), true);
    } catch (e: any) {
        error([
            { text: 'Error deleteMessageIds:', val: e.message },
            { text: 'Stack:', val: e.stack },
        ]);
    }
}

export { deleteMessageIds, saveMessageIds };
