import axios from 'axios';

import path from 'node:path';
import fs from 'node:fs';
import type { Adapter, Part, TelegramParams } from '@backend/types/types';
import { validateDirectory } from '@backend/lib/utils';
import { sendToTelegram } from '@backend/app/telegram';
import { errorLogger } from '@backend/app/logging';

async function httpRequest(
    adapter: Adapter,
    instance: string,
    parts: Part,
    userToSend: string,
    telegramParams: TelegramParams,
    directoryPicture: string,
): Promise<boolean | undefined> {
    if (!parts.httpRequest) {
        return;
    }
    for (const { url, password, user: username, filename } of parts.httpRequest) {
        adapter.log.debug(`URL : ${url}`);

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
            adapter.log.debug(`Pic saved : ${imagePath}`);

            await sendToTelegram({
                instance,
                userToSend,
                textToSend: imagePath,
                telegramParams,
            });
        } catch (e: any) {
            errorLogger('Error http request:', e, adapter);
        }
    }
    return true;
}

export { httpRequest };
