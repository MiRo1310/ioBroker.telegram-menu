export const isTruthy = (value: string | number | boolean): boolean => ['1', 1, true, 'true'].includes(value);

export const isFalsy = (value: string | number | boolean | undefined | null): boolean =>
    ['0', 0, false, 'false', undefined, null].includes(value);
