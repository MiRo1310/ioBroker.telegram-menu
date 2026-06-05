export function countItemsInArray(data: string[] | undefined, searchedString: string): number {
    if (!data) {
        return 0;
    }
    return data.filter(el => el.trim() === searchedString.trim()).length;
}

export function isNavigationRow(row: unknown): row is { call: string } {
    return typeof row === 'object' && row !== null && 'call' in row && !('trigger' in row);
}
