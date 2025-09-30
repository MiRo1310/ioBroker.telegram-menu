"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const testing_1 = require("@iobroker/testing");
const integration_1 = __importDefault(require("./integration/"));
// Run integration tests - See https://github.com/ioBroker/testing for a detailed explanation and further options
testing_1.tests.integration(path_1.default.join(__dirname, '..'), {
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
        (0, integration_1.default)(suite);
    },
});
//# sourceMappingURL=integration.js.map