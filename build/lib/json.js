"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toJson = exports.makeValidJson = exports.escapeJsonString = void 0;
const logging_1 = require("../app/logging");
const escapeJsonString = (input) => {
    return input
        .replace(/\\/g, '\\\\') // Escape Backslashes
        .replace(/"/g, '\\"') // Escape doppelte Anführungszeichen
        .replace(/'/g, '"'); // Ersetze einfache Anführungszeichen durch doppelte
};
exports.escapeJsonString = escapeJsonString;
const makeValidJson = (input, adapter) => {
    try {
        // Entferne unnötige Leerzeichen und überprüfe die Struktur
        const sanitizedInput = input.trim();
        // Versuche, den String direkt zu parsen
        const parsed = JSON.parse(sanitizedInput);
        return { validJson: JSON.stringify(parsed), error: false };
    }
    catch (error) {
        console.log(error);
        // Wenn der direkte Parse-Versuch fehlschlägt, wende Escaping an
        try {
            const escapedString = (0, exports.escapeJsonString)(input);
            const parsed = JSON.parse(escapedString);
            return { validJson: JSON.stringify(parsed), error: false };
        }
        catch (innerError) {
            (0, logging_1.errorLogger)('Error makeValidJson:', innerError, adapter);
            return { validJson: input, error: true };
        }
    }
};
exports.makeValidJson = makeValidJson;
const toJson = (val) => JSON.stringify(val, null, 2);
exports.toJson = toJson;
//# sourceMappingURL=json.js.map