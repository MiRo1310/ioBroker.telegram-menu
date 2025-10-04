"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInstanceActive = void 0;
const isInstanceActive = (telegramInstanceList, instance) => telegramInstanceList.find(i => i.name === instance)?.active ?? false;
exports.isInstanceActive = isInstanceActive;
//# sourceMappingURL=instance.js.map