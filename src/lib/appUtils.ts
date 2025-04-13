import { config } from '../config/config';

export const checkOneLineValue = (text: string): string =>
    !text.includes(config.rowSplitter) ? `${text} ${config.rowSplitter}` : text;
