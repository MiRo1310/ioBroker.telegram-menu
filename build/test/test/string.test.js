"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../../src/lib/string");
const chai_1 = require("chai");
const testing_1 = require("@iobroker/testing");
const { adapter, database } = testing_1.utils.unit.createMocks({});
describe('jsonString', () => {
    it('jsonString', () => {
        const result = (0, string_1.jsonString)({ test: 'test' });
        (0, chai_1.expect)(result).to.equal('{"test":"test"}');
    });
});
describe('parseJSON', () => {
    it('parseJSON with json', () => {
        const result = (0, string_1.parseJSON)('{"test":123}');
        (0, chai_1.expect)(result).to.deep.equal({ isValidJson: true, json: { test: 123 } });
    });
    it('parseJSON with incorrect json', () => {
        const result = (0, string_1.parseJSON)('test');
        (0, chai_1.expect)(result).to.deep.equal({ isValidJson: false, json: 'test' });
    });
});
describe('replaceAll', () => {
    it('Replace all', () => {
        const texts = [
            { val: 'Test', expect: 'Test' },
            {
                val: 'Abc. Def. Ghi.//.',
                expect: 'Abc  Def  Ghi //',
            },
        ];
        texts.forEach(text => {
            const result = (0, string_1.replaceAll)(text.val, '.', ' ');
            (0, chai_1.expect)(result).to.equal(text.expect);
        });
    });
});
describe('validateNewLine', () => {
    it('Validate new line', () => {
        const result = (0, string_1.validateNewLine)('Das hier ist ein\\n Test');
        (0, chai_1.expect)(result).to.equal('Das hier ist ein\n Test');
    });
    it('Validate new line with empty text', () => {
        const result = (0, string_1.validateNewLine)(undefined);
        (0, chai_1.expect)(result).to.equal('');
    });
    it('soll \\n in echten Zeilenumbruch umwandeln', () => {
        const input = 'Das\\\\\n hier\\\\n ist ein\\\n Test';
        const expected = 'Das\n hier\n ist ein\n Test';
        const result = (0, string_1.validateNewLine)(input);
        (0, chai_1.expect)(result).to.equal(expected);
    });
});
describe('decomposeText', () => {
    it('Decompose text check values', () => {
        const result = (0, string_1.decomposeText)('Das ist ein __Test. Das ist ein Test2', '__', '.');
        (0, chai_1.expect)(result).to.deep.equal({
            startindex: 12,
            endindex: 18,
            substring: '__Test.',
            textWithoutSubstring: 'Das ist ein  Das ist ein Test2',
            substringExcludedSearch: 'Test',
        });
        const result2 = (0, string_1.decomposeText)('Das ist ein __Test.', '?', '.');
        (0, chai_1.expect)(result2).to.deep.equal({
            startindex: -1,
            endindex: 18,
            substring: 'Das ist ein __Test.',
            textWithoutSubstring: '',
            substringExcludedSearch: "Das ist ein __Test"
        });
        const result3 = (0, string_1.decomposeText)('Das ist ein __Test.', '?', '-');
        (0, chai_1.expect)(result3).to.deep.equal({
            startindex: -1,
            endindex: -1,
            substring: '',
            textWithoutSubstring: 'Das ist ein __Test.',
            substringExcludedSearch: ""
        });
    });
});
describe('getValueToExchange', () => {
    afterEach(() => {
        adapter.resetMockHistory();
        database.clear();
    });
    it('soll den Wert erfolgreich austauschen, wenn JSON korrekt ist', () => {
        const textToSend = 'change{"true":"an","false":"aus"}';
        const val = 'true';
        const result = (0, string_1.getValueToExchange)(adapter, textToSend, val);
        (0, chai_1.expect)(result).to.deep.equal({
            newValue: 'an',
            textToSend: '',
            error: false,
        });
    });
    it('soll den ursprünglichen Wert zurückgeben, wenn JSON ungültig ist', () => {
        const textToSend = 'change{"true":"an","false":aus}';
        const val = 'true';
        const result = (0, string_1.getValueToExchange)(adapter, textToSend, val);
        (0, chai_1.expect)(adapter.log.error.calledOnce).to.be.true;
        (0, chai_1.expect)(result).to.deep.equal({
            newValue: val,
            textToSend,
            error: true,
        });
    });
    it("soll den ursprünglichen Text zurückgeben, wenn kein 'change' enthalten ist", () => {
        const textToSend = 'Kein Austausch erforderlich';
        const val = 'true';
        const result = (0, string_1.getValueToExchange)(adapter, textToSend, val);
        (0, chai_1.expect)(result).to.deep.equal({
            newValue: val,
            textToSend,
            error: false,
        });
    });
});
describe('isString', () => {
    it('should return true for string values', () => {
        (0, chai_1.expect)((0, string_1.isString)('hello')).to.be.true;
        (0, chai_1.expect)((0, string_1.isString)('')).to.be.true;
    });
    it('should return false for non-string values', () => {
        (0, chai_1.expect)((0, string_1.isString)(123)).to.be.false;
        (0, chai_1.expect)((0, string_1.isString)(true)).to.be.false;
        (0, chai_1.expect)((0, string_1.isString)(null)).to.be.false;
        (0, chai_1.expect)((0, string_1.isString)(undefined)).to.be.false;
        (0, chai_1.expect)((0, string_1.isString)({})).to.be.false;
        (0, chai_1.expect)((0, string_1.isString)([])).to.be.false;
    });
});
describe('StringReplacer', () => {
    it('should remove all matching strings from the substring', () => {
        const substring = 'Hello World!';
        const valueToReplace = ['Hello', 'World'];
        const result = (0, string_1.stringReplacer)(substring, valueToReplace);
        (0, chai_1.expect)(result).to.equal(' !');
    });
    it('should replace all matching objects in the substring', () => {
        const substring = 'Hello World!';
        const valueToReplace = [
            { val: 'Hello', newValue: 'Hi' },
            { val: 'World', newValue: 'Earth' },
        ];
        const result = (0, string_1.stringReplacer)(substring, valueToReplace);
        (0, chai_1.expect)(result).to.equal('Hi Earth!');
    });
    it('should return the original substring if no matches are found', () => {
        const substring = 'Hello World!';
        const valueToReplace = ['Test'];
        const result = (0, string_1.stringReplacer)(substring, valueToReplace);
        (0, chai_1.expect)(result).to.equal('Hello World!');
    });
    it('should handle an empty array for valueToReplace', () => {
        const substring = 'Hello World!';
        const valueToReplace = [];
        const result = (0, string_1.stringReplacer)(substring, valueToReplace);
        (0, chai_1.expect)(result).to.equal('Hello World!');
    });
    it('should handle an empty substring', () => {
        const substring = '';
        const valueToReplace = ['Hello', 'World'];
        const result = (0, string_1.stringReplacer)(substring, valueToReplace);
        (0, chai_1.expect)(result).to.equal('');
    });
});
//# sourceMappingURL=string.test.js.map