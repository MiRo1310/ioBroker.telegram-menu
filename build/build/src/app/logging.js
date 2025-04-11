"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = void 0;
const main_1 = require("../main");
const errorLogger = (title, e) => {
    main_1._this.log.error(title);
    main_1._this.log.error(`Error message: ${e.message}`);
    main_1._this.log.error(`Error stack: ${e.stack}`);
    main_1._this.log.error(`Server response: ${e?.response?.status}`);
    main_1._this.log.error(`Server data: ${e?.response?.data}`);
};
exports.errorLogger = errorLogger;
