/* global it before */

import { expect } from 'chai';
import { setTimeValue } from '../../src/lib/utilities';
import { TestSuite } from '@iobroker/testing/build/tests/integration';
import { TestHarness } from '@iobroker/testing/build/tests/integration/lib/harness';

const runTests = function (suite: TestSuite) {
    suite('Replace time', getHarness => {
        let harness: TestHarness;

        before(async () => {
            harness = getHarness();
            await harness.startController();
            await harness.startAdapterAndWait();
        });

        it('should replace Zeit korrekt bei gültiger ID', async () => {
            // Mock für adapter.getForeignStateAsync
            // harness.objects.getForeignStateAsync = async () => ({ ts: 1710000000000, lc: 1710000000000 });
            if (harness.isControllerRunning()) {
                console.log('import setTimeValue');
                const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'testId'}";
                await setTimeValue(text);
                expect(true).to.false;
            } else {
                console.log('Controller not running');
            }
        });
    });
};

export default { runTests };
