/* global it before */

const expect = require('chai').expect;

exports.runTests = function (suite) {
    suite('Replace time', getHarness => {
        let harness;
        let setTimeValue;

        before(async () => {
            harness = getHarness();
            console.log('Inhalt von __dirname:', require('fs').readdirSync(__dirname + '/../../src/lib/'));
            const utils = require('../../src/lib/utilities.ts');
            setTimeValue = utils.setTimeValue;
        });

        it('should replace Zeit korrekt bei gültiger ID', async () => {
            // Mock für adapter.getForeignStateAsync
            harness.objects.getForeignStateAsync = async () => ({ ts: 1710000000000, lc: 1710000000000 });
            await harness.startAdapterAndWait();
            console.log('import setTimeValue');
            // const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'testId'}";
            // await setTimeValue(text);
            expect(true).to.false;
        });
    });
};
