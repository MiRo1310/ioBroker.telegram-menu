const path = require('path');
const { tests } = require('@iobroker/testing');
const { TestContext } = require('@iobroker/testing/build/tests/integration');
const integrationTests = require('./integrationTests/setTimeValue');

// Run tests
tests.integration(path.join(__dirname, '..'), {
    defineAdditionalTests({ suite }) {
        integrationTests.runTests(suite);
    },
});
