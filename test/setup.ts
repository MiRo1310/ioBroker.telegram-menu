import { utils } from "@iobroker/testing";

const { adapter, database } = utils.unit.createMocks({});

global.afterEach(() => {
    adapter.resetMockHistory();
    database.clear();
});

export { adapter, database };