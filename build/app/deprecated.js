"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findDeprecatedAndLog = exports.regexIdText = void 0;
exports.regexIdText = /\{\s*'id':'[^']*'[\s\S]*?'text':'[^']*'\s*\}/;
const findDeprecatedAndLog = (adapter, actions) => {
    const actionsAsString = JSON.stringify(actions);
    if (exports.regexIdText.test(actionsAsString)) {
        adapter.log.warn('You are using a no longer functioning way to set the return text. Please change it to the new way. Old way: {\'id\':\'adapter.0.example\', \'text\':\'Text\'}. New way: {"foreignId":"adapter.0.example","text":"Text"}');
    }
};
exports.findDeprecatedAndLog = findDeprecatedAndLog;
//# sourceMappingURL=deprecated.js.map