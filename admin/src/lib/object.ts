export const getDoubleEntries = (array: string[]): string[] => {
    const entries = [...array];
    const doubleEntries: string[] = [];
    entries.forEach((element, index) => {
        if (index !== entries.indexOf(element)) {
            if (element != "-") {
                doubleEntries.push(element);
            }
        }
    });
    return doubleEntries
};


export function getFirstItem(obj: { [key: string]: any }) {
    return Object.keys(obj)[0];
}