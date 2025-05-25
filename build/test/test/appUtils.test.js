"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appUtils_1 = require("../../src/lib/appUtils"); // Adjust the path as needed
const chai_1 = require("chai");
const testing_1 = require("@iobroker/testing");
const exchangeValue_1 = require("../../src/lib/exchangeValue");
const { adapter } = testing_1.utils.unit.createMocks({});
describe('checkOneLineValue', () => {
    it("should add a row splitter to the end of the text if it doesn't already contain one", () => {
        const result = (0, appUtils_1.checkOneLineValue)('Hello this is a test');
        (0, chai_1.expect)(result).to.equal('Hello this is a test &&');
    });
    it('should not add a row splitter if the text already contains one', () => {
        const result = (0, appUtils_1.checkOneLineValue)('Hello this is a test &&');
        (0, chai_1.expect)(result).to.equal('Hello this is a test &&');
    });
});
describe('calcValue', () => {
    it('should calculate a valid mathematical expression', () => {
        const textToSend = 'Test {math:+5}';
        const val = '10';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test',
            calculated: 15,
            error: false,
        });
    });
    it('should return the original text and value if the expression is invalid', () => {
        const textToSend = 'Test {math:+}';
        const val = '10';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test',
            calculated: '10',
            error: true,
        });
    });
    it('should handle empty input gracefully', () => {
        const textToSend = '';
        const val = '';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: '',
            calculated: '',
            error: false,
        });
    });
    it('should return the original text if no math expression is found', () => {
        const textToSend = 'No math here';
        const val = '10';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'No math here',
            calculated: 10,
            error: false,
        });
    });
    it('should handle complex expressions correctly', () => {
        const textToSend = 'Test {math:*2} test';
        const val = '5';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
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
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            roundedValue: '123.46',
            text: 'Test',
            error: false,
        });
    });
    it('should handle invalid decimal places gracefully', () => {
        const val = '123.4567';
        const textToSend = 'Test {round:invalid}';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            roundedValue: '123.4567',
            text: 'Test',
            error: true,
        });
    });
    it('should handle empty input gracefully', () => {
        const val = '';
        const textToSend = '';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            roundedValue: 'NaN',
            text: '',
            error: true,
        });
    });
    it('should return an error if the value is not a valid number', () => {
        const val = 'invalid';
        const textToSend = 'Test {round:2}';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            roundedValue: 'NaN',
            text: 'Test',
            error: true,
        });
    });
    it('should handle text without a round command', () => {
        const val = '123.4567';
        const textToSend = 'No round here';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            roundedValue: '123.4567',
            text: 'No round here',
            error: true,
        });
    });
});
describe('getMenusWithUser', () => {
    it('should return menus that include the specified user', () => {
        const menusWithUsers = {
            menu1: ['user1', 'user2'],
            menu2: ['user3'],
            menu3: ['user1', 'user4'],
        };
        const userToSend = 'user1';
        const result = (0, appUtils_1.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
        (0, chai_1.expect)(result).to.deep.equal(['menu1', 'menu3']);
    });
    it('should return an empty array if no menus include the specified user', () => {
        const menusWithUsers = {
            menu1: ['user2'],
            menu2: ['user3'],
        };
        const userToSend = 'user1';
        const result = (0, appUtils_1.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
        (0, chai_1.expect)(result).to.deep.equal([]);
    });
    it('should return an empty array if the menusWithUsers object is empty', () => {
        const menusWithUsers = {};
        const userToSend = 'user1';
        const result = (0, appUtils_1.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
        (0, chai_1.expect)(result).to.deep.equal([]);
    });
    it('should return an empty array if the userToSend is an empty string', () => {
        const menusWithUsers = {
            menu1: ['user1', 'user2'],
            menu2: ['user3'],
        };
        const userToSend = '';
        const result = (0, appUtils_1.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
        (0, chai_1.expect)(result).to.deep.equal([]);
    });
    it('should handle menus with empty user arrays', () => {
        const menusWithUsers = {
            menu1: [],
            menu2: ['user3'],
        };
        const userToSend = 'user3';
        const result = (0, appUtils_1.getListOfMenusIncludingUser)(menusWithUsers, userToSend);
        (0, chai_1.expect)(result).to.deep.equal(['menu2']);
    });
});
describe('getParseMode', () => {
    it('should return "HTML" when the input is true', () => {
        const result = (0, appUtils_1.getParseMode)(true);
        (0, chai_1.expect)(result).to.equal('HTML');
    });
    it('should return "Markdown" when the input is false', () => {
        const result = (0, appUtils_1.getParseMode)(false);
        (0, chai_1.expect)(result).to.equal('Markdown');
    });
    it('should return "Markdown" when the input is undefined', () => {
        const result = (0, appUtils_1.getParseMode)();
        (0, chai_1.expect)(result).to.equal('Markdown');
    });
});
describe('getTypeofTimestamp', () => {
    it('should return "lc" when the array contains "lc"', () => {
        const result = (0, appUtils_1.getTypeofTimestamp)('lc ts');
        (0, chai_1.expect)(result).to.equal('lc');
    });
    it('should return "ts" when the array does not contain "lc" but contains "ts"', () => {
        const result = (0, appUtils_1.getTypeofTimestamp)('ts');
        (0, chai_1.expect)(result).to.equal('ts');
    });
    it('should return "ts" when the array is empty or does not contain "lc" or "ts"', () => {
        const result = (0, appUtils_1.getTypeofTimestamp)('');
        (0, chai_1.expect)(result).to.equal('ts');
    });
    it('should return "ts" when the array contains unrelated values', () => {
        const result = (0, appUtils_1.getTypeofTimestamp)('random value');
        (0, chai_1.expect)(result).to.equal('ts');
    });
});
describe('statusIdAndParams', () => {
    it('should parse id and shouldChange correctly when oldWithId is present', () => {
        const input = "'id':'test.0.test':true";
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: 'test.0.test',
            shouldChangeByStatusParameter: true,
        });
    });
    it('should parse id and shouldChange correctly when oldWithId is not present', () => {
        const input = '"test.0.test":true';
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: 'test.0.test',
            shouldChangeByStatusParameter: true,
        });
    });
    it('should handle input with missing shouldChange value', () => {
        const input = "'id':'test.0.test':";
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: 'test.0.test',
            shouldChangeByStatusParameter: false,
        });
    });
    it('should handle input with missing id value', () => {
        const input = ':true';
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: '',
            shouldChangeByStatusParameter: true,
        });
    });
    it('should handle empty input gracefully', () => {
        const input = ':';
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
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
                parse_mode: 'true',
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
        const result = (0, appUtils_1.splitNavigation)(rows);
        (0, chai_1.expect)(result).to.deep.equal(expectedOutput);
    });
    it('should handle empty rows gracefully', () => {
        const rows = [];
        const expectedOutput = [];
        const result = (0, appUtils_1.splitNavigation)(rows);
        (0, chai_1.expect)(result).to.deep.equal(expectedOutput);
    });
    it('should handle rows with one values', () => {
        const rows = [
            {
                value: 'item1',
                text: 'Empty Value',
                parse_mode: 'false',
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
        const result = (0, appUtils_1.splitNavigation)(rows);
        (0, chai_1.expect)(result).to.deep.equal(expectedOutput);
    });
    it('should handle rows with empty values', () => {
        const rows = [
            {
                value: '',
                text: 'Empty Value',
                parse_mode: 'false',
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
        const result = (0, appUtils_1.splitNavigation)(rows);
        (0, chai_1.expect)(result).to.deep.equal(expectedOutput);
    });
    it('should trim all items in the navigation rows', () => {
        const rows = [
            {
                value: ' item1 , item2 && item3 , item4 ',
                text: 'Trim Test',
                parse_mode: 'true',
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
        const result = (0, appUtils_1.splitNavigation)(rows);
        (0, chai_1.expect)(result).to.deep.equal(expectedOutput);
    });
    it('should handle rows with multiple row splitters', () => {
        const rows = [
            {
                value: 'item1,item2 && item3,item4 && item5,item6',
                text: 'Multiple Splitters',
                parse_mode: 'true',
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
        const result = (0, appUtils_1.splitNavigation)(rows);
        (0, chai_1.expect)(result).to.deep.equal(expectedOutput);
    });
});
describe('getNewStructure', () => {
    it('should return an empty object when input is an empty array', () => {
        const input = [];
        const result = (0, appUtils_1.getNewStructure)(input);
        (0, chai_1.expect)(result).to.deep.equal({});
    });
    it('should correctly map a single navigation item to the new structure', () => {
        const input = [
            {
                nav: [['item1', 'item2']],
                text: 'Sample Text',
                parse_mode: true,
                call: 'testCall',
            },
        ];
        const expected = {
            testCall: {
                nav: [['item1', 'item2']],
                text: 'Sample Text',
                parse_mode: true,
            },
        };
        const result = (0, appUtils_1.getNewStructure)(input);
        (0, chai_1.expect)(result).to.deep.equal(expected);
    });
    it('should handle multiple navigation items correctly', () => {
        const input = [
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
        const expected = {
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
        const result = (0, appUtils_1.getNewStructure)(input);
        (0, chai_1.expect)(result).to.deep.equal(expected);
    });
    it('should handle missing or undefined properties gracefully', () => {
        const input = [
            {
                nav: [['item1']],
                text: undefined,
                parse_mode: undefined,
                call: 'call1',
            },
        ];
        const expected = {
            call1: {
                nav: [['item1']],
                text: undefined,
                parse_mode: undefined,
            },
        };
        const result = (0, appUtils_1.getNewStructure)(input);
        (0, chai_1.expect)(result).to.deep.equal(expected);
    });
});
describe('getStartSides', () => {
    const additionalParams = {
        value: '',
        text: '',
        parse_mode: '',
    };
    it('should correctly map start sides for given menusWithUsers and dataObject', () => {
        const menusWithUsers = {
            menu1: ['user1', 'user2'],
            menu2: ['user3'],
        };
        const dataObject = {
            nav: {
                menu1: [{ call: 'start1', ...additionalParams }],
                menu2: [{ call: 'start2', ...additionalParams }],
            },
            action: {},
        };
        const expected = {
            menu1: 'start1',
            menu2: 'start2',
        };
        const result = (0, appUtils_1.getStartSides)(menusWithUsers, dataObject);
        (0, chai_1.expect)(result).to.deep.equal(expected);
    });
});
describe('isStartside', () => {
    it('should return false for "-"', () => {
        const result = (0, appUtils_1.isStartside)('-');
        (0, chai_1.expect)(result).to.be.false;
    });
    it('should return false for an empty string', () => {
        const result = (0, appUtils_1.isStartside)('');
        (0, chai_1.expect)(result).to.be.false;
    });
    it('should return true for any other string', () => {
        const result = (0, appUtils_1.isStartside)('start');
        (0, chai_1.expect)(result).to.be.true;
    });
});
describe('exchangePlaceholderWithValue', () => {
    it('should replace the placeholder with the provided value', () => {
        const textToSend = 'Hello &&!';
        const textToSend2 = 'Hello &amp;&amp;!';
        const val = 'World';
        const result = (0, exchangeValue_1.exchangePlaceholderWithValue)(textToSend, val);
        const result2 = (0, exchangeValue_1.exchangePlaceholderWithValue)(textToSend2, val);
        (0, chai_1.expect)(result).to.equal('Hello World!');
        (0, chai_1.expect)(result2).to.equal('Hello World!');
    });
    it('should append the value if no placeholder is found', () => {
        const textToSend = 'Hello';
        const val = 'World';
        const result = (0, exchangeValue_1.exchangePlaceholderWithValue)(textToSend, val);
        (0, chai_1.expect)(result).to.equal('Hello World');
    });
    it('should handle empty textToSend gracefully', () => {
        const textToSend = '';
        const val = 'Value';
        const result = (0, exchangeValue_1.exchangePlaceholderWithValue)(textToSend, val);
        (0, chai_1.expect)(result).to.equal('Value');
    });
    it('should handle empty value gracefully', () => {
        const textToSend = 'Hello &&';
        const textToSend2 = 'Hello &amp;&amp;';
        const val = '';
        const result = (0, exchangeValue_1.exchangePlaceholderWithValue)(textToSend, val);
        const result2 = (0, exchangeValue_1.exchangePlaceholderWithValue)(textToSend2, val);
        (0, chai_1.expect)(result).to.equal('Hello');
        (0, chai_1.expect)(result2).to.equal('Hello');
    });
    it('should handle both textToSend and value being empty', () => {
        const textToSend = '';
        const val = '';
        const result = (0, exchangeValue_1.exchangePlaceholderWithValue)(textToSend, val);
        (0, chai_1.expect)(result).to.equal('');
    });
});
describe('isSameType', () => {
    it('should return true if the types match', () => {
        const obj = { common: { type: 'string' } };
        const result = (0, appUtils_1.isSameType)('string', obj);
        (0, chai_1.expect)(result).to.be.true;
    });
    it('should return false if the types do not match', () => {
        const obj = { common: { type: 'number' } };
        const result = (0, appUtils_1.isSameType)('string', obj);
        (0, chai_1.expect)(result).to.be.false;
    });
});
//# sourceMappingURL=appUtils.test.js.map