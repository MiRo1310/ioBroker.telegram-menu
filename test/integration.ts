import { TestContext } from '@iobroker/testing/build/tests/integration';
import integrationTests from './integrationTests';

import path from 'path';
import { tests } from '@iobroker/testing';

// Run tests
tests.integration(path.join(__dirname, '..'), {
    //            ~~~~~~~~~~~~~~~~~~~~~~~~~
    // This should be the adapter's root directory

    // If the adapter may call process.exit during startup, define here which exit codes are allowed.
    // By default, termination during startup is not allowed.
    // allowedExitCodes: [11],

    // To test against a different version of JS-Controller, you can change the version or dist-tag here.
    // Make sure to remove this setting when you're done testing.
    controllerVersion: 'dev', // or a specific version like "4.0.1"
    loglevel: 'debug',

    // Define your own tests inside defineAdditionalTests
    defineAdditionalTests({ suite }: TestContext) {
        integrationTests(suite);
    },
});
