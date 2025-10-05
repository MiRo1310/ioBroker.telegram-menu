"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testTools = void 0;
const testData_1 = require("../testdata/testData");
const testTools = (harness) => {
    harness.objects.getForeignStateAsync = async (id) => testData_1.iobrokerTestObjects[id];
    return harness;
};
exports.testTools = testTools;
//# sourceMappingURL=testTools.js.map