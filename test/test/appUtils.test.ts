import {
    calcValue,
    checkOneLineValue,
    getListOfMenusIncludingUser,
    getNewStructure,
    getParseMode,
    getStartSides,
    getTypeofTimestamp,
    isSameType,
    isStartside,
    roundValue,
    splitNavigation,
    statusIdAndParams,
} from '@b/lib/appUtils'; // Adjust the path as needed
import { expect } from 'chai';
import { utils } from '@iobroker/testing';
import type { Adapter, DataObject, NewObjectStructure, splittedNavigation, StartSides } from '@b/types/types';
import { exchangePlaceholderWithValue } from '@b/lib/exchangeValue';
import { BooleanString, MenusWithUsers } from '@/types/app';
const { adapter } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('checkOneLineValue', () => {
    it("should add a row splitter to the end of the text if it doesn't already contain one", () => {
        const result = checkOneLineValue('Hello this is a test');
        expect(result).to.equal('Hello this is a test &&');
    });

    it('should not add a row splitter if the text already contains one', () => {
        const result = checkOneLineValue('Hello this is a test &&');
        expect(result).to.equal('Hello this is a test &&');
    });
});

describe('calcValue', () => {
    it('should calculate a valid mathematical expression', () => {
        const textToSend = 'Test {math:+5}';
        const val = '10';
        const result = calcValue(textToSend, val, mockAdapter);
        expect(result).to.deep.equal({
            textToSend: 'Test',
            calculated: 15,
            error: false,
        });
    });

    it('should return the original text and value if the expression is invalid', () => {
        const textToSend = 'Test {math:+}';
        const val = '10';
        const result = calcValue(textToSend, val, mockAdapter);
        expect(result).to.deep.equal({
            textToSend: 'Test',
            calculated: '10',
            error: true,
        });
    });

    it('should handle empty input gracefully', () => {
        const textToSend = '';
        const val = '';
        const result = calcValue(textToSend, val, mockAdapter);
        expect(result).to.deep.equal({
            textToSend: '',
            calculated: '',
            error: false,
        });
    });

    it('should return the original text if no math expression is found', () => {
        const textToSend = 'No math here';
        const val = '10';
        const result = calcValue(textToSend, val, mockAdapter);
        expect(result).to.deep.equal({
            textToSend: 'No math here',
            calculated: 10,
            error: false,
        });
    });

    it('should handle complex expressions correctly', () => {
        const textToSend = 'Test {math:*2} test';
        const val = '5';
        const result = calcValue(textToSend, val, mockAdapter);
        expect(result).to.deep.equal({
            textToSend: 'Test  test',
            calculated: 10,
            error: false,
        });
    });
});

describe('roundValue', () => {
    it('should round the value to the specified number of decimal places', () => {
        const val = '123.4567';
        const textToSend = 'Test {round:2}';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            roundedValue: '123.46',
            text: 'Test',
            error: false,
        });
    });

    it('should handle invalid decimal places gracefully', () => {
        const val = '123.4567';
        const textToSend = 'Test {round:invalid}';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            roundedValue: '123.4567',
            text: 'Test',
            error: true,
        });
    });

    it('should handle empty input gracefully', () => {
        const val = '';
        const textToSend = '';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            roundedValue: 'NaN',
            text: '',
            error: true,
        });
    });

    it('should return an error if the value is not a valid number', () => {
        const val = 'invalid';
        const textToSend = 'Test {round:2}';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            roundedValue: 'NaN',
            text: 'Test',
            error: true,
        });
    });

    it('should handle text without a round command', () => {
        const val = '123.4567';
        const textToSend = 'No round here';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            roundedValue: '123.4567',
            text: 'No round here',
            error: true,
        });
    });
});

describe('getMenusWithUser', () => {
    it('should return menus that include the specified user', () => {
        const menusWithUsers = {
            menu1: [
                { name: 'user1', chatId: '', instance: '' },
                { name: 'user2', chatId: '', instance: '' },
            ],
            menu2: [{ name: 'user3', chatId: '', instance: '' }],
            menu3: [
                { name: 'user1', chatId: '', instance: '' },
                { name: 'user4', chatId: '', instance: '' },
            ],
        };
        const userToSend = 'user1';
        const result = getListOfMenusIncludingUser(menusWithUsers, userToSend);
        expect(result).to.deep.equal(['menu1', 'menu3']);
    });

    it('should return an empty array if no menus include the specified user', () => {
        const menusWithUsers = {
            menu1: [{ name: 'user2', chatId: '', instance: '' }],
            menu2: [{ name: 'user3', chatId: '', instance: '' }],
        };
        const userToSend = 'user1';
        const result = getListOfMenusIncludingUser(menusWithUsers, userToSend);
        expect(result).to.deep.equal([]);
    });

    it('should return an empty array if the menusWithUsers object is empty', () => {
        const menusWithUsers = {};
        const userToSend = 'user1';
        const result = getListOfMenusIncludingUser(menusWithUsers, userToSend);
        expect(result).to.deep.equal([]);
    });

    it('should return an empty array if the userToSend is an empty string', () => {
        const menusWithUsers = {
            menu1: [
                { name: 'user1', chatId: '', instance: '' },
                { name: 'user2', chatId: '', instance: '' },
            ],
            menu2: [{ name: 'user3', chatId: '', instance: '' }],
        };
        const userToSend = '';
        const result = getListOfMenusIncludingUser(menusWithUsers, userToSend);
        expect(result).to.deep.equal([]);
    });

    it('should handle menus with empty user arrays', () => {
        const menusWithUsers: MenusWithUsers = {
            menu1: [],
            menu2: [{ name: 'user3', chatId: '', instance: '' }],
        };
        const userToSend = 'user3';
        const result = getListOfMenusIncludingUser(menusWithUsers, userToSend);
        expect(result).to.deep.equal(['menu2']);
    });
});

describe('getParseMode', () => {
    it('should return "HTML" when the input is true', () => {
        const result = getParseMode(true);
        expect(result).to.equal('HTML');
    });

    it('should return "Markdown" when the input is false', () => {
        const result = getParseMode(false);
        expect(result).to.equal('Markdown');
    });

    it('should return "Markdown" when the input is undefined', () => {
        const result = getParseMode();
        expect(result).to.equal('Markdown');
    });
});

describe('getTypeofTimestamp', () => {
    it('should return "lc" when the array contains "lc"', () => {
        const result = getTypeofTimestamp('lc ts');
        expect(result).to.equal('lc');
    });

    it('should return "ts" when the array does not contain "lc" but contains "ts"', () => {
        const result = getTypeofTimestamp('ts');
        expect(result).to.equal('ts');
    });

    it('should return "ts" when the array is empty or does not contain "lc" or "ts"', () => {
        const result = getTypeofTimestamp('');
        expect(result).to.equal('ts');
    });

    it('should return "ts" when the array contains unrelated values', () => {
        const result = getTypeofTimestamp('random value');
        expect(result).to.equal('ts');
    });
});

describe('statusIdAndParams', () => {
    it('should parse id and shouldChange correctly when oldWithId is present', () => {
        const input = "'id':'test.0.test':true";
        const result = statusIdAndParams(input);
        expect(result).to.deep.equal({
            id: 'test.0.test',
            shouldChangeByStatusParameter: true,
        });
    });

    it('should parse id and shouldChange correctly when oldWithId is not present', () => {
        const input = '"test.0.test":true';
        const result = statusIdAndParams(input);
        expect(result).to.deep.equal({
            id: 'test.0.test',
            shouldChangeByStatusParameter: true,
        });
    });

    it('should handle input with missing shouldChange value', () => {
        const input = "'id':'test.0.test':";
        const result = statusIdAndParams(input);
        expect(result).to.deep.equal({
            id: 'test.0.test',
            shouldChangeByStatusParameter: false,
        });
    });

    it('should handle input with missing id value', () => {
        const input = ':true';
        const result = statusIdAndParams(input);
        expect(result).to.deep.equal({
            id: '',
            shouldChangeByStatusParameter: true,
        });
    });

    it('should handle empty input gracefully', () => {
        const input = ':';
        const result = statusIdAndParams(input);
        expect(result).to.deep.equal({
            id: '',
            shouldChangeByStatusParameter: false,
        });
    });
});

describe('splitNavigation', () => {
    it('should split navigation rows into the correct structure', () => {
        const rows = [
            {
                value: 'item1,item2 && item3,item4',
                text: 'Test Text',
                parse_mode: 'true' as BooleanString,
                call: 'testCall',
            },
        ];
        const expectedOutput = [
            {
                call: 'testCall',
                text: 'Test Text',
                parse_mode: true,
                nav: [
                    ['item1', 'item2'],
                    ['item3', 'item4'],
                ],
            },
        ];
        const result = splitNavigation(rows);
        expect(result).to.deep.equal(expectedOutput);
    });

    it('should handle empty rows gracefully', () => {
        const rows: any[] = [];
        const expectedOutput: any[] = [];
        const result = splitNavigation(rows);
        expect(result).to.deep.equal(expectedOutput);
    });

    it('should handle rows with one values', () => {
        const rows = [
            {
                value: 'item1',
                text: 'Empty Value',
                parse_mode: 'false' as BooleanString,
                call: 'emptyCall',
            },
        ];
        const expectedOutput = [
            {
                call: 'emptyCall',
                text: 'Empty Value',
                parse_mode: false,
                nav: [['item1'], ['']],
            },
        ];
        const result = splitNavigation(rows);
        expect(result).to.deep.equal(expectedOutput);
    });

    it('should handle rows with empty values', () => {
        const rows = [
            {
                value: '',
                text: 'Empty Value',
                parse_mode: 'false' as BooleanString,
                call: 'emptyCall',
            },
        ];
        const expectedOutput = [
            {
                call: 'emptyCall',
                text: 'Empty Value',
                parse_mode: false,
                nav: [[''], ['']],
            },
        ];
        const result = splitNavigation(rows);
        expect(result).to.deep.equal(expectedOutput);
    });

    it('should trim all items in the navigation rows', () => {
        const rows = [
            {
                value: ' item1 , item2 && item3 , item4 ',
                text: 'Trim Test',
                parse_mode: 'true' as BooleanString,
                call: 'trimCall',
            },
        ];
        const expectedOutput = [
            {
                call: 'trimCall',
                text: 'Trim Test',
                parse_mode: true,
                nav: [
                    ['item1', 'item2'],
                    ['item3', 'item4'],
                ],
            },
        ];
        const result = splitNavigation(rows);
        expect(result).to.deep.equal(expectedOutput);
    });

    it('should handle rows with multiple row splitters', () => {
        const rows = [
            {
                value: 'item1,item2 && item3,item4 && item5,item6',
                text: 'Multiple Splitters',
                parse_mode: 'true' as BooleanString,
                call: 'multiCall',
            },
        ];
        const expectedOutput = [
            {
                call: 'multiCall',
                text: 'Multiple Splitters',
                parse_mode: true,
                nav: [
                    ['item1', 'item2'],
                    ['item3', 'item4'],
                    ['item5', 'item6'],
                ],
            },
        ];
        const result = splitNavigation(rows);
        expect(result).to.deep.equal(expectedOutput);
    });
});

describe('getNewStructure', () => {
    it('should return an empty object when input is an empty array', () => {
        const input: splittedNavigation[] = [];
        const result = getNewStructure(input);
        expect(result).to.deep.equal({});
    });

    it('should correctly map a single navigation item to the new structure', () => {
        const input: splittedNavigation[] = [
            {
                nav: [['item1', 'item2']],
                text: 'Sample Text',
                parse_mode: true,
                call: 'testCall',
            },
        ];
        const expected: NewObjectStructure = {
            testCall: {
                nav: [['item1', 'item2']],
                text: 'Sample Text',
                parse_mode: true,
            },
        };
        const result = getNewStructure(input);
        expect(result).to.deep.equal(expected);
    });

    it('should handle multiple navigation items correctly', () => {
        const input: splittedNavigation[] = [
            {
                nav: [['item1', 'item2']],
                text: 'Text 1',
                parse_mode: true,
                call: 'call1',
            },
            {
                nav: [['item3', 'item4']],
                text: 'Text 2',
                parse_mode: false,
                call: 'call2',
            },
        ];
        const expected: NewObjectStructure = {
            call1: {
                nav: [['item1', 'item2']],
                text: 'Text 1',
                parse_mode: true,
            },
            call2: {
                nav: [['item3', 'item4']],
                text: 'Text 2',
                parse_mode: false,
            },
        };
        const result = getNewStructure(input);
        expect(result).to.deep.equal(expected);
    });

    it('should handle missing or undefined properties gracefully', () => {
        const input: splittedNavigation[] = [
            {
                nav: [['item1']],
                text: undefined as unknown as string,
                parse_mode: undefined as unknown as boolean,
                call: 'call1',
            },
        ];
        const expected: NewObjectStructure = {
            call1: {
                nav: [['item1']],
                text: undefined,
                parse_mode: undefined,
            },
        };
        const result = getNewStructure(input);
        expect(result).to.deep.equal(expected);
    });
});

describe('getStartSides', () => {
    const additionalParams: { value: string; text: string; parse_mode: BooleanString } = {
        value: '',
        text: '',
        parse_mode: 'true',
    };
    it('should correctly map start sides for given menusWithUsers and dataObject', () => {
        const menusWithUsers: MenusWithUsers = {
            menu1: [
                { name: 'user1', chatId: '', instance: '' },
                { name: 'user2', chatId: '', instance: '' },
            ],
            menu2: [{ name: 'user3', chatId: '', instance: '' }],
        };
        const dataObject: DataObject = {
            nav: {
                menu1: [{ call: 'start1', ...additionalParams }],
                menu2: [{ call: 'start2', ...additionalParams }],
            },
            action: {},
        };
        const expected: StartSides = {
            menu1: 'start1',
            menu2: 'start2',
        };
        const result = getStartSides(menusWithUsers, dataObject);
        expect(result).to.deep.equal(expected);
    });
});

describe('isStartside', () => {
    it('should return false for "-"', () => {
        const result = isStartside('-');
        expect(result).to.be.false;
    });

    it('should return false for an empty string', () => {
        const result = isStartside('');
        expect(result).to.be.false;
    });

    it('should return true for any other string', () => {
        const result = isStartside('start');
        expect(result).to.be.true;
    });
});

describe('exchangePlaceholderWithValue', () => {
    it('should replace the placeholder with the provided value', () => {
        const textToSend = 'Hello &&!';
        const textToSend2 = 'Hello &amp;&amp;!';
        const val = 'World';
        const result = exchangePlaceholderWithValue(textToSend, val);
        const result2 = exchangePlaceholderWithValue(textToSend2, val);
        expect(result).to.equal('Hello World!');
        expect(result2).to.equal('Hello World!');
    });

    it('should append the value if no placeholder is found', () => {
        const textToSend = 'Hello';
        const val = 'World';
        const result = exchangePlaceholderWithValue(textToSend, val);
        expect(result).to.equal('Hello World');
    });

    it('should handle empty textToSend gracefully', () => {
        const textToSend = '';
        const val = 'Value';
        const result = exchangePlaceholderWithValue(textToSend, val);
        expect(result).to.equal('Value');
    });

    it('should handle empty value gracefully', () => {
        const textToSend = 'Hello &&';
        const textToSend2 = 'Hello &amp;&amp;';
        const val = '';
        const result = exchangePlaceholderWithValue(textToSend, val);
        const result2 = exchangePlaceholderWithValue(textToSend2, val);
        expect(result).to.equal('Hello');
        expect(result2).to.equal('Hello');
    });

    it('should handle both textToSend and value being empty', () => {
        const textToSend = '';
        const val = '';
        const result = exchangePlaceholderWithValue(textToSend, val);
        expect(result).to.equal('');
    });
});

describe('isSameType', () => {
    it('should return true if the types match', () => {
        const obj = { common: { type: 'string' } } as ioBroker.Object;
        const result = isSameType('string', obj);
        expect(result).to.be.true;
    });

    it('should return false if the types do not match', () => {
        const obj = { common: { type: 'number' } } as ioBroker.Object;
        const result = isSameType('string', obj);
        expect(result).to.be.false;
    });
});
