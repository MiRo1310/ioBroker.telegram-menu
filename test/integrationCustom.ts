import path from 'path';
import { tests } from '@iobroker/testing';
import integrationTests from './integration/';

// Run integration tests - See https://github.com/ioBroker/testing for a detailed explanation and further options
tests.integration(path.join(__dirname, '../..'), {
    //            ~~~~~~~~~~~~~~~~~~~~~~~~~
    // This should be the adapter's root directory

    // If the adapter may call process.exit during startup, define here which exit codes are allowed.
    // By default, termination during startup is not allowed.
    //allowedExitCodes: [11],

    // To test against a different version of JS-Controller, you can change the version or dist-tag here.
    // Make sure to remove this setting when you're done testing.
    controllerVersion: 'latest', // 'latest', 'dev' or a specific version like '4.0.23'

    /** The loglevel to use for DB and adapter related logs */
    loglevel: 'debug',

    // Define your own tests inside defineAdditionalTests
    // Since the tests are heavily instrumented, you need to create and use a so-called "harness" to control the tests.
    defineAdditionalTests({ suite }) {
        integrationTests(suite);
    },
});
