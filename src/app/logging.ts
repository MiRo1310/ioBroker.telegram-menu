import type { Adapter } from '../types/types';

export const errorLogger = (title: string, e: any, adapter: Adapter): void => {
    adapter.log.error(title);
    adapter.log.error(`Error message: ${e.message}`);
    adapter.log.error(`Error stack: ${e.stack}`);
    adapter.log.error(`Server response: ${e?.response?.status}`);
    adapter.log.error(`Server data: ${e?.response?.data}`);
};
