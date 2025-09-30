import setTimeValue from './setTimeValue';
import { TestSuite } from '@iobroker/testing/build/tests/integration';

export default function (suite: TestSuite) {
    setTimeValue.runTests(suite);
}
