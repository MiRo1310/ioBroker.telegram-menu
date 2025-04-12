import { adapter } from '../main';
import { deleteMessageByBot } from './botAction';
import { errorLogger } from './logging';
import type { UserListWithChatId, WhatShouldDelete } from '../types/types';
import { deepCopy, getChatID } from '../lib/utils';

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
    try {
        let requestMessageId: Messages = {};
        let requestMessageIdObj: ioBroker.State | null | undefined = null;
        if (!isDeleting) {
            requestMessageIdObj = await adapter.getStateAsync('communication.requestIds');
        }
        isDeleting = false;
        const requestUserIdObj = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestChatId`);

        const request = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.request`);

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
        await adapter.setState('communication.requestIds', JSON.stringify(requestMessageId), true);
    } catch (e: any) {
        errorLogger('Error saveMessageIds:', e, adapter);
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
    try {
        const requestMessageIdObj = await adapter.getStateAsync('communication.requestIds');
        const lastMessageId = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.requestMessageId`);

        if (
            !requestMessageIdObj ||
            typeof requestMessageIdObj.val !== 'string' ||
            !JSON.parse(requestMessageIdObj.val)
        ) {
            return;
        }

        const chat_id = getChatID(userListWithChatID, user);
        if (!chat_id) {
            return;
        }
        const messageIds: Messages = JSON.parse(requestMessageIdObj.val);

        if (lastMessageId && lastMessageId.val) {
            messageIds[chat_id].push({ id: lastMessageId.val.toString() });
        }

        isDeleting = true;
        const copyMessageIds = deepCopy(messageIds, adapter);
        messageIds[chat_id].forEach((element, index) => {
            if (whatShouldDelete === 'all' && element.id) {
                deleteMessageByBot(
                    instanceTelegram,
                    user,
                    userListWithChatID,
                    parseInt(element.id?.toString()),
                    chat_id,
                );
            }
            if (whatShouldDelete === 'last' && index === messageIds[chat_id].length - 1 && element.id) {
                deleteMessageByBot(
                    instanceTelegram,
                    user,
                    userListWithChatID,
                    parseInt(element.id?.toString()),
                    chat_id,
                );
            }
            if (!copyMessageIds) {
                return;
            }
            copyMessageIds[chat_id] = removeMessageFromList({ element, chat_id, copyMessageIds });
        });

        await adapter.setState('communication.requestIds', JSON.stringify(copyMessageIds), true);
    } catch (e: any) {
        errorLogger('Error deleteMessageIds:', e, adapter);
    }
}

export { deleteMessageIds, saveMessageIds };
