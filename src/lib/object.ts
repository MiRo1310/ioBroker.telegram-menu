export const deleteDoubleEntriesInArray = (arr: string[]): string[] =>
    arr.filter((item, index) => arr.indexOf(item) === index);
