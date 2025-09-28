/* global it before */

const expect = require('chai').expect;

exports.runTests = function (suite) {
    suite('alarm_control_panel', getHarness => {
        //adapter will keep running for all test. harness and initial entities will be initialized once in before.
        let harness;

        const initialStates = [
            {
                id: 'adapter.0.alarm_control_panel.noArmState',
                val: 0,
            },
        ];
        before(async () => {
            //get harness && entities here.
            harness = getHarness();
        });

        it('Should not failed', async () => {
            expect(true).to.true;
        });

        it('Should failed', async () => {
            expect(false).to.true;
        });
    });
};
