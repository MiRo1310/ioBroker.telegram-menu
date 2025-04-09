import { _this } from '../main';

export const toLocaleDate = (time: Date): string => {
    return time.toLocaleDateString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });
};

export const processTimeValue = (textToSend: string, obj: ioBroker.State): string => {
    const date = new Date(Number(obj.val));

    if (isNaN(date.getTime())) {
        _this.log.error(`Invalid Date: ${String(date)}`);
        return textToSend;
    }

    return textToSend.replace('{time}', toLocaleDate(date));
};
