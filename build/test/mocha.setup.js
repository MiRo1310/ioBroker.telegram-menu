"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Don't silently swallow unhandled rejections
process.on("unhandledRejection", (e) => {
    throw e;
});
// enable the should interface with sinon
// and load chai-as-promised and sinon-chai by default
const sinonChai = require("sinon-chai"); // eslint-disable-line @typescript-eslint/no-var-requires
const chaiAsPromised = require("chai-as-promised"); // eslint-disable-line @typescript-eslint/no-var-requires
const { should, use } = require("chai"); // eslint-disable-line @typescript-eslint/no-var-requires
should();
use(sinonChai);
use(chaiAsPromised);
//# sourceMappingURL=mocha.setup.js.map