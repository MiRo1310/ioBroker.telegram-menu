import type { Adapter, MessageInfos, Messages, TelegramParams, WhatShouldDelete } from '@backend/types/types';
import { parseJSON } from '@backend/lib/string';
import { errorLogger } from '@backend/app/logging';
import { deepCopy, getChatID } from '@backend/lib/utils';
import { deleteMessageByBot } from '@backend/app/botAction';

class MessageIdManager {
    private isDeleting = false;

    public async saveMessageIds(adapter: Adapter, state: ioBroker.State, instanceTelegram: string): Promise<void> {
        try {
            let requestMessageId: Messages = {};

            const requestMessageIdObj = !this.isDeleting
                ? await adapter.getStateAsync('communication.requestIds')
                : null;

            this.isDeleting = false;
            const requestUserIdObj = await adapter.getForeignStateAsync(
                `${instanceTelegram}.communicate.requestChatId`,
            );

            const request = await adapter.getForeignStateAsync(`${instanceTelegram}.communicate.request`);

            if (!requestUserIdObj?.val) {
                return;
            }
            let isValidJson = false;
            let json = {};

            if (requestMessageIdObj?.val) {
                const result = parseJSON<Messages>(String(requestMessageIdObj?.val), adapter);
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
        } catch (e: any) {
            errorLogger('Error saveMessageIds:', e, adapter);
        }
    }

    public async deleteMessageIds(
        instance: string,
        user: string,
        telegramParams: TelegramParams,
        whatShouldDelete: WhatShouldDelete,
    ): Promise<void> {
        const { userListWithChatID, adapter } = telegramParams;
        try {
            const requestMessageIdObj = await adapter.getStateAsync('communication.requestIds');
            const lastMessageId = await adapter.getForeignStateAsync(`${instance}.communicate.requestMessageId`);

            if (
                !requestMessageIdObj ||
                typeof requestMessageIdObj.val !== 'string' ||
                !JSON.parse(requestMessageIdObj.val)
            ) {
                return;
            }

            const chat_id = getChatID(userListWithChatID, user);
            const { json, isValidJson } = parseJSON<Messages>(requestMessageIdObj.val);

            if (!isValidJson || !chat_id) {
                return;
            }
            if (lastMessageId && lastMessageId.val) {
                json[chat_id].push({ id: lastMessageId.val.toString() });
            }

            this.isDeleting = true;
            const copyMessageIds = deepCopy(json, adapter);
            json[chat_id].forEach((element, index) => {
                const id = element.id?.toString();

                if (whatShouldDelete === 'all' && id) {
                    deleteMessageByBot(adapter, instance, user, parseInt(id), chat_id);
                }
                if (whatShouldDelete === 'last' && index === json[chat_id].length - 1 && id) {
                    deleteMessageByBot(adapter, instance, user, parseInt(id), chat_id);
                }
                /* istanbul ignore next */
                if (!copyMessageIds) {
                    return;
                }
                copyMessageIds[chat_id] = this.removeMessageFromList({ element, chat_id, copyMessageIds });
            });

            await adapter.setState('communication.requestIds', JSON.stringify(copyMessageIds), true);
        } catch (e: any) {
            errorLogger('Error deleteMessageIds:', e, adapter);
        }
    }

    private removeOldMessageIds(messages: Messages, chatID: string): Messages {
        messages[chatID] = messages[chatID].filter(message => {
            return message.time && message.time > Date.now() - 1000 * 60 * 60 * 24 * 2;
        });
        return messages;
    }

    private removeMessageFromList = ({
        element,
        chat_id,
        copyMessageIds,
    }: {
        element: MessageInfos;
        chat_id: string;
        copyMessageIds: Messages;
    }): MessageInfos[] => {
        return copyMessageIds[chat_id].filter(message => message.id !== element.id);
    };
}

export const messageIdManager = new MessageIdManager();
export const saveMessageIds = messageIdManager.saveMessageIds.bind(messageIdManager);
export const deleteMessageIds = messageIdManager.deleteMessageIds.bind(messageIdManager);
