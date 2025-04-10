import { _this } from '../main';

interface LoggingTypes {
    text?: string;
    val?: any;
}
[];

type Logging = 'debug' | 'error' | 'info';

const logging = (type: Logging, obj: LoggingTypes[]): void => {
    if (obj) {
        obj.forEach(element => {
            let text = '';
            if (element.text) {
                text = element.text;
            }
            if (element.val) {
                text += ` ${JSON.stringify(element.val)}`;
            }
            _this.log[type](text);
        });
        return;
    }
};
export const info = (obj: LoggingTypes[]): void => {
    logging('info', obj);
};

export const debug = (obj: LoggingTypes[]): void => {
    logging('debug', obj);
};

export const errorLogger = (title: string, e: any): void => {
    _this.log.error(title);
    _this.log.error(`Error message: ${e.message}`);
    _this.log.error(`Error stack: ${e.stack}`);
    _this.log.error(`Server response: ${e?.response?.status}`);
    _this.log.error(`Server data: ${e?.response?.data}`);
};
