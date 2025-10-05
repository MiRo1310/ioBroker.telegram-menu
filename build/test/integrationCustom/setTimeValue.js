"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runTests;
const chai_1 = require("chai");
const utilities_1 = require("../../src/lib/utilities");
const testTools_1 = require("./testTools");
const config_1 = require("../../src/config/config");
function runTests(suite) {
    suite('SetTimeValue', getHarness => {
        let harness;
        before(async () => {
            harness = getHarness();
            await harness.startAdapter();
            await harness.startController();
            harness = (0, testTools_1.testTools)(harness);
        });
        it('With Invalid Id, because to short', async () => {
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'date'}";
            const result = await (0, utilities_1.setTimeValue)(harness.objects, text);
            (0, chai_1.expect)(result).to.equal(`Text ${config_1.invalidId}`);
        });
        it('With Valid id does not exist', async () => {
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'undefined-id'}";
            const result = await (0, utilities_1.setTimeValue)(harness.objects, text);
            (0, chai_1.expect)(result).to.equal(`Text ${config_1.invalidId}`);
        });
        it('With Valid id', async () => {
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'test.0.date'}";
            const result = await (0, utilities_1.setTimeValue)(harness.objects, text);
            (0, chai_1.expect)(result).to.equal(`Text 03 10 2025 15:05:52:480`);
        });
    });
}
//# sourceMappingURL=setTimeValue.js.map