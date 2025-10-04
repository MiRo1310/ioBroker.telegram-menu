import { TestHarness } from '@iobroker/testing/build/tests/integration/lib/harness';
import { iobrokerTestObjects } from '../testdata/testData';

export const testTools = (harness: TestHarness) => {
    harness.objects.getForeignStateAsync = async (id: string) => iobrokerTestObjects[id];

    return harness;
};
