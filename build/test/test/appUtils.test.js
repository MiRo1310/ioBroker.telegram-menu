"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appUtils_1 = require("../../src/lib/appUtils");
const chai_1 = require("chai");
describe("checkOneLineValue", () => {
    it("should add a row splitter to the end of the text if it doesn't already contain one", () => {
        const result = (0, appUtils_1.checkOneLineValue)("Hello this is a test");
        (0, chai_1.expect)(result).to.equal("Hello this is a test &&");
    });
    it("should not add a row splitter if the text already contains one", () => {
        const result = (0, appUtils_1.checkOneLineValue)("Hello this is a test &&");
        (0, chai_1.expect)(result).to.equal("Hello this is a test &&");
    });
});
//# sourceMappingURL=appUtils.test.js.map