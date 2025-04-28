import axios from 'axios';
import { sendToTelegram } from './telegram';
import path from 'path';
import fs from 'fs';
import { errorLogger } from './logging';
import type { Part, TelegramParams, UserListWithChatId } from '../types/types';
import { validateDirectory } from '../lib/utils';
import { adapter } from '../main';

async function httpRequest(
    parts: Part,
    userToSend: string,
    telegramParams: TelegramParams,
    userListWithChatID: UserListWithChatId[],
    directoryPicture: string,
): Promise<boolean | undefined> {
    if (!parts.httpRequest) {
        return;
    }
    for (const { url, password, user: username, filename } of parts.httpRequest) {
        adapter.log.debug(`URL: ${url}`);

        try {
            //prettier-ignore

            const response = await axios(
                username && password
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
                      },
            );

            if (!validateDirectory(adapter, directoryPicture)) {
                return;
            }
            const imagePath = path.join(directoryPicture, filename);

            fs.writeFileSync(imagePath, Buffer.from(response.data), 'binary');
            adapter.log.debug(`Pic saved: ${imagePath}`);

            await sendToTelegram({
                userToSend,
                textToSend: imagePath,
                telegramParams,
                userListWithChatID,
            });
        } catch (e: any) {
            errorLogger('Error http request:', e, adapter);
        }
    }
    return true;
}

export { httpRequest };
