import { exec } from 'node:child_process';
import { errorLogger } from '@backend/app/logging';
import type { AppContext } from '@backend/app/appContext';

export function loadWithCurl(appContext: AppContext, path: string, url: string, callback?: () => void): void {
    exec(
        `curl -H "Authorization: Bearer ${appContext.token.trim()}" "${url}" > ${path}`,
        (error: any, stdout: any, stderr: any) => {
            if (stdout) {
                appContext.adapter.log.debug(`Stdout : "${stdout}"`);
            }
            if (stderr) {
                appContext.adapter.log.debug(`Stderr : "${stderr}"`);
            }
            if (error) {
                errorLogger('Error in exec:', error, appContext.adapter);
                return;
            }
            if (!callback) {
                return;
            }
            appContext.adapter.log.debug('Curl command executed successfully');
            callback();
        },
    );
}
