"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
const logging_1 = require("../app/logging");
function evaluate(val, adapter) {
    try {
        return { val: eval(val.join(' ')) ?? '', error: false };
    }
    catch (e) {
        (0, logging_1.errorLogger)('Error Eval:', e, adapter);
        return { val: '', error: true };
    }
}
//# sourceMappingURL=math.js.map