export function parseJSON<T>(val: string): { json: T; isValidJson: boolean } {
    try {
        const parsed = JSON.parse(val);
        return { json: parsed, isValidJson: true };
    } catch (error) {
        console.error([{ text: 'Error:', val: error }]);
        return { json: {} as T, isValidJson: false };
    }
}

export const jsonString = (val?: string | number | boolean | object | null): string => JSON.stringify(val);
