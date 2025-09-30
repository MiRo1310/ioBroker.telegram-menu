/* global it before */

const { setTimeValue } = require('../../build/lib/utilities');
const { expect } = require('chai');

exports.runTests = function (suite) {
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
            await setTimeValue(text);
            expect(true).to.false;
        });
    });
};
