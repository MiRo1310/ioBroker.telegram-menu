import { exec } from 'child_process';
import type { Adapter } from '@b/types/types';
import { errorLogger } from '@b/app/logging';

export function loadWithCurl(adapter: Adapter, token: string, path: string, url: string, callback?: () => void): void {
    exec(
        `curl -H "Authorization: Bearer ${token.trim()}" "${url}" > ${path}`,
        (error: any, stdout: any, stderr: any) => {
            if (stdout) {
                adapter.log.debug(`Stdout : "${stdout}"`);
            }
            if (stderr) {
                adapter.log.debug(`Stderr : "${stderr}"`);
            }
            if (error) {
                errorLogger('Error in exec:', error, adapter);
                return;
            }
            if (!callback) {
                return;
            }
            adapter.log.debug('Curl command executed successfully');
            callback();
        },
    );
}
