export function replaceSpaceWithUnderscore(menu: string): string {
    return menu.replace(/ /g, '_');
}

export function isTruthy(value: string | number | boolean): boolean {
    return value === '1' || value === 1 || value === true || value === 'true';
}

export function isFalsy(value: string | number | boolean): boolean {
    return value === '0' || value === 0 || value === false || value === 'false';
}
