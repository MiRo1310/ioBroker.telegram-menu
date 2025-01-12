export const getDoubleEntries = (array: string[]): string[] => {
    const entries = [...array];
    const doubleEntries: string[] = [];
    entries.forEach((element, index) => {
        if (index !== entries.indexOf(element)) {
            if (element != '-') {
                doubleEntries.push(element);
            }
        }
    });
    return doubleEntries;
};

export const getFirstItem = (obj: { [key: string]: any }): any => Object.keys(obj)[0];
