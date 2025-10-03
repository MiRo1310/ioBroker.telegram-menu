import { TestSuite } from '@iobroker/testing/build/tests/integration';
import { TestHarness } from '@iobroker/testing/build/tests/integration/lib/harness';

import { expect } from 'chai';
import { setTimeValue } from '../../src/lib/utilities';
import { testTools } from './testTools';
import { invalidId } from '../../src/config/config';

export default function runTests(suite: TestSuite) {
    suite('SetTimeValue', getHarness => {
        let harness: TestHarness;

        before(async () => {
            harness = getHarness();
            await harness.startAdapter();
            await harness.startController();
            harness = testTools(harness);
        });

        it('With Invalid Id', async () => {
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'date'}";
            const result = await setTimeValue(harness.objects, text);
            expect(result).to.equal(`Text ${invalidId}`);
        });

        it('With Valid id', async () => {
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'test.0.date'}";
            const result = await setTimeValue(harness.objects, text);
            expect(result).to.equal(`Text 03 10 2025 15:05:52:480`);
        });
    });
}
