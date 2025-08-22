import type { Part } from '../types/types';

export const isParseModeFirstElement = (part: Part): boolean | undefined => part.getData?.[0].parse_mode;
