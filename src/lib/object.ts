import type { SetStateIds } from '../types/types';

export const removeDuplicates = (arr: string[]): string[] => arr.filter((item, index) => arr.indexOf(item) === index);

export const trimAllItems = (array: string[]): string[] => array.map(item => item.trim());

export const setStateIdsToIdArray = (setStateIds: SetStateIds[]): string[] => setStateIds.map(obj => obj.id);
