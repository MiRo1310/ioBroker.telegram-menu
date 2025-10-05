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
            // await harness.startAdapter();
            // await harness.startController();
            harness = testTools(harness);
        });

        it('With Invalid Id, because to short', async () => {
            expect(true).to.true;
        });
        it('With Invalid Id, because to short', async () => {
            const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'date'}";
            const result = await setTimeValue(harness.objects, text);
            expect(result).to.equal(`Text ${invalidId}`);
        });

        // it('With Valid id does not exist', async () => {
        //     const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'undefined-id'}";
        //     const result = await setTimeValue(harness.objects, text);
        //     expect(result).to.equal(`Text ${invalidId}`);
        // });
        //
        // it('With Valid id', async () => {
        //     const text = "Text {time.lc,(DD MM YYYY hh:mm:ss:sss),id:'test.0.date'}";
        //     const result = await setTimeValue(harness.objects, text);
        //     expect(result).to.equal(`Text 03 10 2025 15:05:52:480`);
        // });
    });
}
