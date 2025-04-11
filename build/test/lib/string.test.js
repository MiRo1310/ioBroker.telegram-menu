"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../../src/lib/string");
const chai_1 = require("chai");
const testing_1 = require("@iobroker/testing");
const { adapter, database } = testing_1.utils.unit.createMocks({});
describe("String", () => {
    afterEach(() => {
        // The mocks keep track of all method invocations - reset them after each single test
        adapter.resetMockHistory();
        // We want to start each test with a fresh database
        database.clear();
    });
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
    it("Decompose text", () => {
        const result = (0, string_1.decomposeText)("Das ist ein __Test. Das ist ein Test2", "__", ".");
        (0, chai_1.expect)(result).to.deep.equal({ startindex: 12, endindex: 18, substring: "__Test.", textWithoutSubstring: "Das ist ein  Das ist ein Test2" });
        const result2 = (0, string_1.decomposeText)("Das ist ein __Test.", "?", ".");
        (0, chai_1.expect)(result2).to.deep.equal({ startindex: -1, endindex: 18, substring: "Das ist ein __Test.", textWithoutSubstring: "" });
        const result3 = (0, string_1.decomposeText)("Das ist ein __Test.", "?", "-");
        (0, chai_1.expect)(result3).to.deep.equal({ startindex: -1, endindex: -1, substring: "", textWithoutSubstring: "Das ist ein __Test." });
    });
    it("soll den Wert erfolgreich austauschen, wenn JSON korrekt ist", () => {
        const textToSend = 'change{"true":"an","false":"aus"}';
        const val = "true";
        const result = (0, string_1.getValueToExchange)(textToSend, val);
        (0, chai_1.expect)(result).to.deep.equal({
            newValue: "an",
            textToSend: "",
            error: false,
        });
    });
    it("soll den ursprünglichen Wert zurückgeben, wenn JSON ungültig ist", () => {
        const textToSend = 'change{"true":"an","false":aus}';
        const val = "true";
        const result = (0, string_1.getValueToExchange)(textToSend, val);
        (0, chai_1.expect)(adapter.log.error.calledOnce).to.be.true;
        (0, chai_1.expect)(result).to.deep.equal({
            newValue: val,
            textToSend,
            error: true,
        });
    });
    it("soll den ursprünglichen Text zurückgeben, wenn kein 'change' enthalten ist", () => {
        const textToSend = "Kein Austausch erforderlich";
        const val = "true";
        const result = (0, string_1.getValueToExchange)(textToSend, val);
        (0, chai_1.expect)(result).to.deep.equal({
            newValue: val,
            textToSend,
            error: false,
        });
    });
});
//# sourceMappingURL=string.test.js.map