"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = void 0;
const adapterManager_1 = require("./adapterManager");
const errorLogger = (title, e) => {
    adapterManager_1.adapter.log.error(title);
    adapterManager_1.adapter.log.error(`Error message: ${e.message}`);
    adapterManager_1.adapter.log.error(`Error stack: ${e.stack}`);
    adapterManager_1.adapter.log.error(`Server response: ${e?.response?.status}`);
    adapterManager_1.adapter.log.error(`Server data: ${e?.response?.data}`);
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=logging.js.map