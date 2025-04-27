import { errorLogger } from '../app/logging';
import type { Adapter } from '../types/types';

export const escapeJsonString = (input: string): string => {
    return input
        .replace(/\\/g, '\\\\') // Escape Backslashes
        .replace(/"/g, '\\"') // Escape doppelte Anführungszeichen
        .replace(/'/g, '"'); // Ersetze einfache Anführungszeichen durch doppelte
};

export const makeValidJson = (input: string, adapter: Adapter): { validJson: string; error: boolean } => {
    try {
        // Entferne unnötige Leerzeichen und überprüfe die Struktur
        const sanitizedInput = input.trim();

        // Versuche, den String direkt zu parsen
        const parsed = JSON.parse(sanitizedInput);
        return { validJson: JSON.stringify(parsed), error: false };
    } catch (error) {
        console.log(error);
        // Wenn der direkte Parse-Versuch fehlschlägt, wende Escaping an
        try {
            const escapedString = escapeJsonString(input);
            const parsed = JSON.parse(escapedString);
            return { validJson: JSON.stringify(parsed), error: false };
        } catch (innerError) {
            errorLogger('Error makeValidJson:', innerError, adapter);
            return { validJson: input, error: true };
        }
    }
};
