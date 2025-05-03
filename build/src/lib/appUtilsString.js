"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaceholderValue = getPlaceholderValue;
function getPlaceholderValue(textToSend) {
    if (textToSend.includes('&&')) {
        return '&&';
    }
    if (textToSend.includes('&amp;&amp;')) {
        return '&amp;&amp;';
    }
    return '';
}
//# sourceMappingURL=appUtilsString.js.map