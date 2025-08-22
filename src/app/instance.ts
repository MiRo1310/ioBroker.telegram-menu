import type { InstanceList } from '../types/types';

export const isInstanceActive = (telegramInstanceList: InstanceList[], instance: string): boolean =>
    telegramInstanceList.find(i => i.name === instance)?.active ?? false;
