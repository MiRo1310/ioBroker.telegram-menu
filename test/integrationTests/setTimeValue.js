/* global it before */

const expect = require('chai').expect;

exports.runTests = function (suite) {
    suite('alarm_control_panel', getHarness => {
        let harness;

        before(async () => {
            harness = getHarness();
        });

        it('should replace Zeit korrekt bei gültiger ID', async () => {
            // Mock für adapter.getForeignStateAsync
            console.log(harness);
            harness.objects.getForeignStateAsync = async () => ({ ts: 1710000000000, lc: 1710000000000 });
            const { setTimeValue } = require('../../src/lib/utilities');
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'testId'}";
            const result = await setTimeValue(text);
            expect(result).to.not.include('Invalid ID');
            expect(result).to.not.equal('Text 2025 10 08 03:20:00:000');
        });

        it('should return "Invalid ID" bei ungültiger ID', async () => {
            harness.adapter.getForeignStateAsync = async () => undefined;

            const { setTimeValue } = require('../../src/lib/utilities');
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'bad'}";
            const result = await setTimeValue(text);
            expect(result).to.include('Invalid ID');
        });
    });
};
