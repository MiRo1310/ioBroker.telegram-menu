import axios from 'axios';
import { sendToTelegram } from './telegram';
import path from 'path';
import fs from 'fs';
import { errorLogger } from './logging';
import type { Part, UserListWithChatId } from '../types/types';
import { validateDirectory } from '../lib/utils';
import { adapter } from '../main';

async function httpRequest(
    parts: Part,
    userToSend: string,
    instanceTelegram: string,
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
    directoryPicture: string,
): Promise<boolean | undefined> {
    if (!parts.httpRequest) {
        return;
    }
    for (const part of parts.httpRequest) {
        const { url, password, user } = part;

        const method = 'get';
        adapter.log.debug(`URL: ${url}`);

        try {
            //prettier-ignore
            const response = await axios(
                user && password
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
                    },
            );
            if (!part.filename) {
                return;
            }
            if (!validateDirectory(adapter, directoryPicture)) {
                return;
            }
            const imagePath = path.join(directoryPicture, part.filename);

            fs.writeFileSync(imagePath, Buffer.from(response.data), 'binary');
            adapter.log.debug(`Pic saved: ${imagePath}`);

            await sendToTelegram({
                userToSend,
                textToSend: imagePath,
                telegramInstance: instanceTelegram,
                resize_keyboard,
                one_time_keyboard,
                userListWithChatID,
            });
        } catch (e: any) {
            errorLogger('Error http request:', e, adapter);
        }
    }
    return true;
}

export { httpRequest };
