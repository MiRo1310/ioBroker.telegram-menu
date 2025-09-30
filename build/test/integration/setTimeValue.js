"use strict";
/* global it before */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utilities_1 = require("../../src/lib/utilities");
function runTests(suite) {
    suite('Test', getHarness => {
        let harness;
        before(async () => {
            harness = getHarness();
            // await harness.startController();
            await harness.startAdapterAndWait();
        });
        it('Test', async () => {
            harness.objects.getForeignStateAsync = async () => ({ ts: 1710000000000, lc: 1710000000000 });
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'testId'}";
            await (0, utilities_1.setTimeValue)(text);
            (0, chai_1.expect)(true).to.false;
        });
    });
}
exports.default = runTests;
//# sourceMappingURL=setTimeValue.js.map