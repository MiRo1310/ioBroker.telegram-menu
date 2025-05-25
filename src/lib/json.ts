export const toJson = (val: string | number | boolean | object): string => JSON.stringify(val, null, 2);
