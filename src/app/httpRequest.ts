import axios from 'axios';

import path from 'path';
import fs from 'fs';
import type { Adapter, Part, TelegramParams } from '@b/types/types';
import { validateDirectory } from '@b/lib/utils';
import { sendToTelegram } from '@b/app/telegram';
import { errorLogger } from '@b/app/logging';

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
