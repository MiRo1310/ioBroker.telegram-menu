import {
    cleanUpString,
    decomposeText,
    ifTruthyAddNewLine,
    isBooleanString,
    isEmptyString,
    isNonEmptyString,
    isString,
    jsonString,
    pad,
    parseJSON,
    removeDuplicateSpaces,
    removeQuotes,
    replaceAll,
    replaceAllItems,
    stringReplacer,
} from '@b/lib/string';
import { expect } from 'chai';
import { utils } from '@iobroker/testing';
import { timeStringReplacer } from '@b/lib/appUtils';
import { exchangeValue } from '@b/lib/exchangeValue';
import type { Adapter } from '@b/types/types';

const { adapter, database } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('jsonString', () => {
    it('jsonString', () => {
        const result = jsonString({ test: 'test' });
        expect(result).to.equal('{"test":"test"}');
    });
});

describe('parseJSON', () => {
    it('parseJSON with json', () => {
        const result = parseJSON<Record<string, number>>('{"test":123}');
        expect(result).to.deep.equal({ isValidJson: true, json: { test: 123 } });
    });

    it('parseJSON with incorrect json', () => {
        const result = parseJSON('test');
        expect(result).to.deep.equal({ isValidJson: false, json: 'test' });
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
            const result = replaceAll(text.val, '.', ' ');
            expect(result).to.equal(text.expect);
        });
    });
});

describe('replaceAllItems', () => {
    it('should replace all matching strings in the text', () => {
        const text = 'Hello World!';
        const searched = ['Hello', 'World'];
        const result = replaceAllItems(text, searched);
        expect(result).to.equal(' !');
    });

    it('should replace all matching objects in the text', () => {
        const text = 'Hello World!';
        const searched = [
            { search: 'Hello', val: 'Hi' },
            { search: 'World', val: 'Earth' },
        ];
        const result = replaceAllItems(text, searched);
        expect(result).to.equal('Hi Earth!');
    });

    it('should return the original text if no matches are found', () => {
        const text = 'Hello World!';
        const searched = ['Test'];
        const result = replaceAllItems(text, searched);
        expect(result).to.equal('Hello World!');
    });

    it('should handle an empty array for searched', () => {
        const text = 'Hello World!';
        const searched: string[] = [];
        const result = replaceAllItems(text, searched);
        expect(result).to.equal('Hello World!');
    });

    it('should handle an empty text', () => {
        const text = '';
        const searched = ['Hello', 'World'];
        const result = replaceAllItems(text, searched);
        expect(result).to.equal('');
    });

    it('should handle mixed types in the searched array', () => {
        const text = 'Hello World!';
        const searched = ['Hello', { search: 'World', val: 'Earth' }];
        const result = replaceAllItems(text, searched);
        expect(result).to.equal(' Earth!');
    });
});

describe('removeQuotes', () => {
    it('should remove single quotes from the string', () => {
        const input = "'Hello World'";
        const result = removeQuotes(input);
        expect(result).to.equal('Hello World');
    });

    it('should remove double quotes from the string', () => {
        const input = '"Hello World"';
        const result = removeQuotes(input);
        expect(result).to.equal('Hello World');
    });

    it('should remove both single and double quotes from the string', () => {
        const input = `"'Hello' "World""`;
        const result = removeQuotes(input);
        expect(result).to.equal('Hello World');
    });

    it('should return the same string if no quotes are present', () => {
        const input = 'Hello World';
        const result = removeQuotes(input);
        expect(result).to.equal('Hello World');
    });

    it('should handle an empty string', () => {
        const input = '';
        const result = removeQuotes(input);
        expect(result).to.equal('');
    });

    it('should handle a string with only quotes', () => {
        const input = `'"'`;
        const result = removeQuotes(input);
        expect(result).to.equal('');
    });
});

describe('validateNewLine', () => {
    it('should return a Validated string with newline', () => {
        const result = cleanUpString('Das hier ist ein\\n Test');
        expect(result).to.equal('Das hier ist ein\nTest');
    });

    it('should return a validated string newline with empty text', () => {
        const result = cleanUpString(undefined);
        expect(result).to.equal('');
    });

    it('should convert \\n into actual line breaks', () => {
        const input = 'Das\\\\\n hier\\\\n ist ein\\\n Test';
        const expected = 'Das\nhier\nist ein\nTest';
        const result = cleanUpString(input);

        expect(result).to.equal(expected);
    });
});

describe('decomposeText', () => {
    it('Decompose text check values', () => {
        const result = decomposeText('Das ist ein __Test. Das ist ein Test2', '__', '.');
        expect(result).to.deep.equal({
            startindex: 12,
            endindex: 18,
            substring: '__Test.',
            textExcludeSubstring: 'Das ist ein  Das ist ein Test2',
            substringExcludeSearch: 'Test',
        });

        const result2 = decomposeText('Das ist ein __Test.', '?', '.');
        expect(result2).to.deep.equal({
            startindex: -1,
            endindex: 18,
            substring: 'Das ist ein __Test.',
            textExcludeSubstring: '',
            substringExcludeSearch: 'Das ist ein __Test',
        });

        const result3 = decomposeText('Das ist ein __Test.', '?', '-');
        expect(result3).to.deep.equal({
            startindex: -1,
            endindex: -1,
            substring: '',
            textExcludeSubstring: 'Das ist ein __Test.',
            substringExcludeSearch: '',
        });
    });
});

describe('getValueToExchange', () => {
    afterEach(() => {
        adapter.resetMockHistory();
        database.clear();
    });

    it('should successfully exchange the value if the JSON is correct', () => {
        const textToSend = '   Test && change{"true":"an","false":"aus"} test';
        const val = 'true';
        const result = exchangeValue(mockAdapter, textToSend, val);

        expect(result).to.deep.equal({
            newValue: 'an',
            textToSend: 'Test an test',
            error: false,
        });
    });

    it('should return the original value if the JSON is invalid', () => {
        const textToSend = ' test    change{"true":"an","false":aus}';
        const val = 'true';
        const result = exchangeValue(mockAdapter, textToSend, val);
        expect(adapter.log.error.calledOnce).to.be.true;
        expect(result).to.deep.equal({
            newValue: val,
            textToSend: 'test change{"true":"an","false":aus}',
            error: true,
        });
    });

    it("should return the original text if no 'change' is included", () => {
        const textToSend = 'Kein   Austausch   erforderlich';
        const val = 'true';
        const result = exchangeValue(mockAdapter, textToSend, val);

        expect(result).to.deep.equal({
            newValue: val,
            textToSend: 'Kein Austausch erforderlich true',
            error: false,
        });
    });
});

describe('isString', () => {
    it('should return true for string values', () => {
        expect(isString('hello')).to.be.true;
        expect(isString('')).to.be.true;
    });

    it('should return false for non-string values', () => {
        expect(isString(123)).to.be.false;
        expect(isString(true)).to.be.false;
        expect(isString(null)).to.be.false;
        expect(isString(undefined)).to.be.false;
        expect(isString({})).to.be.false;
        expect(isString([])).to.be.false;
    });
});

describe('StringReplacer', () => {
    it('should remove all matching strings from the substring', () => {
        const substring = 'Hello World!';
        const valueToReplace = ['Hello', 'World'];
        const result = stringReplacer(substring, valueToReplace);
        expect(result).to.equal(' !');
    });

    it('should replace all matching objects in the substring', () => {
        const substring = 'Hello World!';
        const valueToReplace = [
            { val: 'Hello', newValue: 'Hi' },
            { val: 'World', newValue: 'Earth' },
        ];
        const result = stringReplacer(substring, valueToReplace);
        expect(result).to.equal('Hi Earth!');
    });

    it('should return the original substring if no matches are found', () => {
        const substring = 'Hello World!';
        const valueToReplace = ['Test'];
        const result = stringReplacer(substring, valueToReplace);
        expect(result).to.equal('Hello World!');
    });

    it('should handle an empty array for valueToReplace', () => {
        const substring = 'Hello World!';
        const valueToReplace: string[] = [];
        const result = stringReplacer(substring, valueToReplace);
        expect(result).to.equal('Hello World!');
    });

    it('should handle an empty substring', () => {
        const substring = '';
        const valueToReplace = ['Hello', 'World'];
        const result = stringReplacer(substring, valueToReplace);
        expect(result).to.equal('');
    });
});

describe('pad', () => {
    it('should pad a number with leading zeros to the default length of 2', () => {
        const result = pad(5);
        expect(result).to.equal('05');
    });

    it('should pad a number with leading zeros to a specified length', () => {
        const result = pad(5, 4);
        expect(result).to.equal('0005');
    });

    it('should not pad a number if it already meets the specified length', () => {
        const result = pad(123, 2);
        expect(result).to.equal('123');
    });

    it('should handle zero correctly', () => {
        const result = pad(0, 3);
        expect(result).to.equal('000');
    });

    it('should convert negative numbers to strings without additional padding', () => {
        const result = pad(-5, 3);
        expect(result).to.equal('-05');
    });

    it('should handle a length of 0 by returning the number as a string', () => {
        const result = pad(5, 0);
        expect(result).to.equal('5');
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
        const result = timeStringReplacer(input, template);
        expect(result).to.equal('2023-07-01 12:30:45.123');
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
        const result = timeStringReplacer(input, template);
        expect(result).to.equal('15/12/2025 08:05');
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
        const result = timeStringReplacer(input, template);
        expect(result).to.equal('No placeholders here');
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
        const result = timeStringReplacer(input, undefined);
        expect(result).to.be.undefined;
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
        const result = timeStringReplacer(input, template);
        expect(result).to.equal('2024-11-10');
    });
});

describe('getNewline', () => {
    it('soll "\\n" zurückgeben, wenn die Eingabe truthy ist', () => {
        expect(ifTruthyAddNewLine('true')).to.equal('\n');
        expect(ifTruthyAddNewLine('false')).to.equal('');
    });
});

describe('isBooleanString', () => {
    it('should return true for "true"', () => {
        expect(isBooleanString('true')).to.be.true;
    });

    it('should return true for "false"', () => {
        expect(isBooleanString('false')).to.be.true;
    });

    it('should return false for non-boolean strings', () => {
        expect(isBooleanString('yes')).to.be.false;
        expect(isBooleanString('no')).to.be.false;
        expect(isBooleanString('')).to.be.false;
    });
});

describe('String Utility Functions', () => {
    describe('isNonEmptyString', () => {
        it('should return true for a non-empty string', () => {
            expect(isNonEmptyString('hello')).to.be.true;
        });

        it('should return false for an empty string', () => {
            expect(isNonEmptyString('')).to.be.false;
        });

        it('should return false for a string with only spaces', () => {
            expect(isNonEmptyString('   ')).to.be.false;
        });
    });

    describe('isEmptyString', () => {
        it('should return true for an empty string', () => {
            expect(isEmptyString('')).to.be.true;
        });

        it('should return true for a string with only spaces', () => {
            expect(isEmptyString('   ')).to.be.true;
        });

        it('should return false for a non-empty string', () => {
            expect(isEmptyString('hello')).to.be.false;
        });
    });
});

describe('remove duplicated spaces', () => {
    it('should return do nothing is not exist', () => {
        expect(removeDuplicateSpaces('Test')).to.be.equal('Test');
    });

    it('should trim and remove duplicated spaces', () => {
        expect(removeDuplicateSpaces(' Test  Test   ')).to.be.equal('Test Test');
    });

    it('should trim and remove duplicated spaces', () => {
        expect(removeDuplicateSpaces('  Test   ')).to.be.equal('Test');
    });
});
