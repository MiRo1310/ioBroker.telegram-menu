"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const testing_1 = require("@iobroker/testing");
// Run integration tests - See https://github.com/ioBroker/testing for a detailed explanation and further options
testing_1.tests.integration(path_1.default.join(__dirname, '..'));
//# sourceMappingURL=integrationCustom.js.map