"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../../src/lib/string");
const chai_1 = require("chai");
describe("String", () => {
    it("jsonString", () => {
        const result = (0, string_1.jsonString)({ test: "test" });
        (0, chai_1.expect)(result).to.equal('{"test":"test"}');
    });
    it("parseJSON with json", () => {
        const result = (0, string_1.parseJSON)('{"test":123}');
        (0, chai_1.expect)(result).to.deep.equal({ isValidJson: true, json: { test: 123 } });
    });
    it("parseJSON with incorrect json", () => {
        const result = (0, string_1.parseJSON)("test");
        (0, chai_1.expect)(result).to.deep.equal({ isValidJson: false, json: "test" });
    });
    it("Replace all", () => {
        const texts = [{ val: "Test", expect: "Test" }, {
                val: "Abc. Def. Ghi.//.", expect: "Abc  Def  Ghi //"
            }];
        texts.forEach(text => {
            const result = (0, string_1.replaceAll)(text.val, ".", " ");
            (0, chai_1.expect)(result).to.equal(text.expect);
        });
    });
    it("Validate new line", () => {
        const result = (0, string_1.validateNewLine)("Das hier ist ein\\n Test");
        (0, chai_1.expect)(result).to.equal("Das hier ist ein\n Test");
    });
    describe('validateNewLine', () => {
        it('soll \\n in echten Zeilenumbruch umwandeln', () => {
            const input = 'Das\\\\\n hier\\\\n ist ein\\\n Test';
            const expected = 'Das\n hier\n ist ein\n Test';
            const result = (0, string_1.validateNewLine)(input);
            (0, chai_1.expect)(result).to.equal(expected);
        });
    });
});
//# sourceMappingURL=string.test.js.map