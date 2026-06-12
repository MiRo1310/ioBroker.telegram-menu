import axios from 'axios';

import path from 'node:path';
import fs from 'node:fs';
import type { Part } from '@backend/types/types';
import { validateDirectory } from '@backend/lib/utils';
import { sendToTelegram } from '@backend/app/telegram';
import { errorLogger } from '@backend/app/logging';
import type { AppContext } from '@backend/app/appContext';

async function httpRequest(
    appContext: AppContext,
    instance: string,
    parts: Part,
    userToSend: string,
): Promise<boolean> {
    if (!parts.httpRequest?.length) {
        return false;
    }
    for (const { url, password, user: username, filename } of parts.httpRequest) {
        if (!url) {
            return false;
        }
        appContext.adapter.log.debug(`URL : ${url}`);

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

            if (!validateDirectory(appContext)) {
                return false;
            }
            const imagePath = path.join(appContext.directoryPicture, filename);

            fs.writeFileSync(imagePath, Buffer.from(response.data), 'binary');
            appContext.adapter.log.debug(`Pic saved : ${imagePath}`);

            await sendToTelegram({
                instance,
                userToSend,
                textToSend: imagePath,
                appContext,
            });
        } catch (e: any) {
            errorLogger('Error http request:', e, appContext.adapter);
        }
    }
    return true;
}

export { httpRequest };
