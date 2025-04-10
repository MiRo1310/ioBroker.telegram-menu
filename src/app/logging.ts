import { _this } from '../main';

export const errorLogger = (title: string, e: any): void => {
    _this.log.error(title);
    _this.log.error(`Error message: ${e.message}`);
    _this.log.error(`Error stack: ${e.stack}`);
    _this.log.error(`Server response: ${e?.response?.status}`);
    _this.log.error(`Server data: ${e?.response?.data}`);
};
