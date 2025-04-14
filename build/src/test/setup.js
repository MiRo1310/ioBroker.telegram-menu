"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.adapter = void 0;
const testing_1 = require("@iobroker/testing");
const { adapter, database } = testing_1.utils.unit.createMocks({});
exports.adapter = adapter;
exports.database = database;
global.afterEach(() => {
    adapter.resetMockHistory();
    database.clear();
});
//# sourceMappingURL=setup.js.map