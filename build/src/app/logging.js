"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = void 0;
const errorLogger = (title, e, adapter) => {
    adapter.log.error(title);
    adapter.log.error(`Error message: ${e.message}`);
    adapter.log.error(`Error stack: ${e.stack}`);
    adapter.log.error(`Server response: ${e?.response?.status}`);
    adapter.log.error(`Server data: ${e?.response?.data}`);
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=logging.js.map