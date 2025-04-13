import {
    decomposeText,
    getValueToExchange,
    isString,
    jsonString,
    parseJSON,
    replaceAll,
    stringReplacer,
    validateNewLine
} from '../../src/lib/string';
import {expect} from 'chai';
import {utils} from "@iobroker/testing";

const { adapter, database } = utils.unit.createMocks({});

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
                expect: 'Abc  Def  Ghi //',
            },
        ];

        texts.forEach(text => {
            const result = replaceAll(text.val, '.', ' ');
            expect(result).to.equal(text.expect);
        });
    });
});

describe('validateNewLine', () => {
    it('Validate new line', () => {
        const result = validateNewLine('Das hier ist ein\\n Test');
        expect(result).to.equal('Das hier ist ein\n Test');
    });

    it('Validate new line with empty text', () => {
        const result = validateNewLine(undefined);
        expect(result).to.equal('');
    });

    it('soll \\n in echten Zeilenumbruch umwandeln', () => {
        const input = 'Das\\\\\n hier\\\\n ist ein\\\n Test';
        const expected = 'Das\n hier\n ist ein\n Test';
        const result = validateNewLine(input);

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
            textWithoutSubstring: 'Das ist ein  Das ist ein Test2',
        });

        const result2 = decomposeText('Das ist ein __Test.', '?', '.');
        expect(result2).to.deep.equal({
            startindex: -1,
            endindex: 18,
            substring: 'Das ist ein __Test.',
            textWithoutSubstring: '',
        });

        const result3 = decomposeText('Das ist ein __Test.', '?', '-');
        expect(result3).to.deep.equal({
            startindex: -1,
            endindex: -1,
            substring: '',
            textWithoutSubstring: 'Das ist ein __Test.',
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
        const result = getValueToExchange(adapter, textToSend, val);

        expect(result).to.deep.equal({
            newValue: 'an',
            textToSend: '',
            error: false,
        });
    });

    it('soll den ursprünglichen Wert zurückgeben, wenn JSON ungültig ist', () => {
        const textToSend = 'change{"true":"an","false":aus}';
        const val = 'true';
        const result = getValueToExchange(adapter, textToSend, val);
        expect(adapter.log.error.calledOnce).to.be.true;
        expect(result).to.deep.equal({
            newValue: val,
            textToSend,
            error: true,
        });
    });

    it("soll den ursprünglichen Text zurückgeben, wenn kein 'change' enthalten ist", () => {
        const textToSend = 'Kein Austausch erforderlich';
        const val = 'true';
        const result = getValueToExchange(adapter, textToSend, val);

        expect(result).to.deep.equal({
            newValue: val,
            textToSend,
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
