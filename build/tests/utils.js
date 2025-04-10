"use strict";
var import_chai = require("chai");
var import_utils = require("../lib/utils");
describe("getChatID", () => {
  const mockData = [
    { name: "Alice", chatID: "123" },
    { name: "Bob", chatID: "456" },
    { name: "Charlie", chatID: "789" }
  ];
  it("sollte die richtige chatID zur\xFCckgeben, wenn der Benutzer existiert", () => {
    const result = (0, import_utils.getChatID)(mockData, "Alice");
    (0, import_chai.expect)(result).to.equal("123");
  });
  it("sollte undefined zur\xFCckgeben, wenn der Benutzer nicht existiert", () => {
    const result = (0, import_utils.getChatID)(mockData, "David");
    (0, import_chai.expect)(result).to.be.undefined;
  });
  it("sollte undefined zur\xFCckgeben, wenn die Liste leer ist", () => {
    const result = (0, import_utils.getChatID)([], "Alice");
    (0, import_chai.expect)(result).to.be.undefined;
  });
});
//# sourceMappingURL=utils.js.map
