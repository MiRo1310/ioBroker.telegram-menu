export const replaceSpaceWithUnderscore = (menu: string): string => menu.replace(/ /g, '_');

export const isTruthy = (val: string | number | boolean): boolean => ['1', 1, true, 'true'].includes(val);

export const isFalsy = (val: string | number | boolean): boolean => ['0', 0, false, 'false'].includes(val);

export const splitTrimAndJoin = (str: string, separator: string, newSeparator?: string): string =>
    str
        .split(separator)
        .map((s: string) => s.trim())
        .join(newSeparator || separator);
