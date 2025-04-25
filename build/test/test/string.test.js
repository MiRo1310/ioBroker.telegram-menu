"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const string_1 = require("../../src/lib/string");
const chai_1 = require("chai");
const testing_1 = require("@iobroker/testing");
const appUtils_1 = require("../../src/lib/appUtils");
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
                expect: 'Abc  Def  Ghi // ',
            },
        ];
        texts.forEach(text => {
            const result = (0, string_1.replaceAll)(text.val, '.', ' ');
            (0, chai_1.expect)(result).to.equal(text.expect);
        });
    });
});
describe('replaceAllItems', () => {
    it('should replace all matching strings in the text', () => {
        const text = 'Hello World!';
        const searched = ['Hello', 'World'];
        const result = (0, string_1.replaceAllItems)(text, searched);
        (0, chai_1.expect)(result).to.equal(' !');
    });
    it('should replace all matching objects in the text', () => {
        const text = 'Hello World!';
        const searched = [
            { search: 'Hello', val: 'Hi' },
            { search: 'World', val: 'Earth' },
        ];
        const result = (0, string_1.replaceAllItems)(text, searched);
        (0, chai_1.expect)(result).to.equal('Hi Earth!');
    });
    it('should return the original text if no matches are found', () => {
        const text = 'Hello World!';
        const searched = ['Test'];
        const result = (0, string_1.replaceAllItems)(text, searched);
        (0, chai_1.expect)(result).to.equal('Hello World!');
    });
    it('should handle an empty array for searched', () => {
        const text = 'Hello World!';
        const searched = [];
        const result = (0, string_1.replaceAllItems)(text, searched);
        (0, chai_1.expect)(result).to.equal('Hello World!');
    });
    it('should handle an empty text', () => {
        const text = '';
        const searched = ['Hello', 'World'];
        const result = (0, string_1.replaceAllItems)(text, searched);
        (0, chai_1.expect)(result).to.equal('');
    });
    it('should handle mixed types in the searched array', () => {
        const text = 'Hello World!';
        const searched = [
            'Hello',
            { search: 'World', val: 'Earth' },
        ];
        const result = (0, string_1.replaceAllItems)(text, searched);
        (0, chai_1.expect)(result).to.equal(' Earth!');
    });
});
describe('removeQuotes', () => {
    it('should remove single quotes from the string', () => {
        const input = "'Hello World'";
        const result = (0, string_1.removeQuotes)(input);
        (0, chai_1.expect)(result).to.equal('Hello World');
    });
    it('should remove double quotes from the string', () => {
        const input = '"Hello World"';
        const result = (0, string_1.removeQuotes)(input);
        (0, chai_1.expect)(result).to.equal('Hello World');
    });
    it('should remove both single and double quotes from the string', () => {
        const input = `"'Hello' "World""`;
        const result = (0, string_1.removeQuotes)(input);
        (0, chai_1.expect)(result).to.equal('Hello World');
    });
    it('should return the same string if no quotes are present', () => {
        const input = 'Hello World';
        const result = (0, string_1.removeQuotes)(input);
        (0, chai_1.expect)(result).to.equal('Hello World');
    });
    it('should handle an empty string', () => {
        const input = '';
        const result = (0, string_1.removeQuotes)(input);
        (0, chai_1.expect)(result).to.equal('');
    });
    it('should handle a string with only quotes', () => {
        const input = `'"'`;
        const result = (0, string_1.removeQuotes)(input);
        (0, chai_1.expect)(result).to.equal('');
    });
});
describe('validateNewLine', () => {
    it('Validate new line', () => {
        const result = (0, string_1.cleanUpString)('Das hier ist ein\\n Test');
        (0, chai_1.expect)(result).to.equal('Das hier ist ein\n Test');
    });
    it('Validate new line with empty text', () => {
        const result = (0, string_1.cleanUpString)(undefined);
        (0, chai_1.expect)(result).to.equal('');
    });
    it('soll \\n in echten Zeilenumbruch umwandeln', () => {
        const input = 'Das\\\\\n hier\\\\n ist ein\\\n Test';
        const expected = 'Das\n hier\n ist ein\n Test';
        const result = (0, string_1.cleanUpString)(input);
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
            textExcludeSubstring: 'Das ist ein  Das ist ein Test2',
            substringExcludeSearch: 'Test',
        });
        const result2 = (0, string_1.decomposeText)('Das ist ein __Test.', '?', '.');
        (0, chai_1.expect)(result2).to.deep.equal({
            startindex: -1,
            endindex: 18,
            substring: 'Das ist ein __Test.',
            textExcludeSubstring: '',
            substringExcludeSearch: "Das ist ein __Test"
        });
        const result3 = (0, string_1.decomposeText)('Das ist ein __Test.', '?', '-');
        (0, chai_1.expect)(result3).to.deep.equal({
            startindex: -1,
            endindex: -1,
            substring: '',
            textExcludeSubstring: 'Das ist ein __Test.',
            substringExcludeSearch: ""
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
describe('pad', () => {
    it('should pad a number with leading zeros to the default length of 2', () => {
        const result = (0, string_1.pad)(5);
        (0, chai_1.expect)(result).to.equal('05');
    });
    it('should pad a number with leading zeros to a specified length', () => {
        const result = (0, string_1.pad)(5, 4);
        (0, chai_1.expect)(result).to.equal('0005');
    });
    it('should not pad a number if it already meets the specified length', () => {
        const result = (0, string_1.pad)(123, 2);
        (0, chai_1.expect)(result).to.equal('123');
    });
    it('should handle zero correctly', () => {
        const result = (0, string_1.pad)(0, 3);
        (0, chai_1.expect)(result).to.equal('000');
    });
    it('should convert negative numbers to strings without additional padding', () => {
        const result = (0, string_1.pad)(-5, 3);
        (0, chai_1.expect)(result).to.equal('-05');
    });
    it('should handle a length of 0 by returning the number as a string', () => {
        const result = (0, string_1.pad)(5, 0);
        (0, chai_1.expect)(result).to.equal('5');
    });
});
describe('timeStringReplacer', () => {
    it('should replace all placeholders with the corresponding values', () => {
        const input = {
            d: '01',
            h: '12',
            m: '30',
            ms: '123',
            y: '2023',
            s: '45',
            mo: '07',
        };
        const template = 'YYYY-MM-DD hh:mm:ss.sss';
        const result = (0, appUtils_1.timeStringReplacer)(input, template);
        (0, chai_1.expect)(result).to.equal('2023-07-01 12:30:45.123');
    });
    it('should handle partial placeholders in the string', () => {
        const input = {
            d: '15',
            h: '08',
            m: '05',
            ms: '001',
            y: '2025',
            s: '59',
            mo: '12',
        };
        const template = 'DD/MM/YYYY hh:mm';
        const result = (0, appUtils_1.timeStringReplacer)(input, template);
        (0, chai_1.expect)(result).to.equal('15/12/2025 08:05');
    });
    it('should return the string unchanged if no placeholders are present', () => {
        const input = {
            d: '01',
            h: '12',
            m: '30',
            ms: '123',
            y: '2023',
            s: '45',
            mo: '07',
        };
        const template = 'No placeholders here';
        const result = (0, appUtils_1.timeStringReplacer)(input, template);
        (0, chai_1.expect)(result).to.equal('No placeholders here');
    });
    it('should return undefined if the input string is undefined', () => {
        const input = {
            d: '01',
            h: '12',
            m: '30',
            ms: '123',
            y: '2023',
            s: '45',
            mo: '07',
        };
        const result = (0, appUtils_1.timeStringReplacer)(input, undefined);
        (0, chai_1.expect)(result).to.be.undefined;
    });
    it('should handle parentheses in the string by removing them', () => {
        const input = {
            d: '10',
            h: '14',
            m: '45',
            ms: '678',
            y: '2024',
            s: '30',
            mo: '11',
        };
        const template = '(YYYY-MM-DD)';
        const result = (0, appUtils_1.timeStringReplacer)(input, template);
        (0, chai_1.expect)(result).to.equal('2024-11-10');
    });
});
describe('getNewline', () => {
    it('soll "\\n" zurückgeben, wenn die Eingabe truthy ist', () => {
        (0, chai_1.expect)((0, string_1.getNewline)('true')).to.equal('\n');
        (0, chai_1.expect)((0, string_1.getNewline)('false')).to.equal('');
    });
});
//# sourceMappingURL=string.test.js.map