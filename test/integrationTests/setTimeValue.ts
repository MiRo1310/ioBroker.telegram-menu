/* global it before */

import { expect } from 'chai';
import { setTimeValue } from '../../src/lib/utilities';
import { TestSuite } from '@iobroker/testing/build/tests/integration';
import { TestHarness } from '@iobroker/testing/build/tests/integration/lib/harness';

const runTests = function (suite: TestSuite) {
    suite('Test', getHarness => {
        let harness: TestHarness;

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

export default { runTests };
