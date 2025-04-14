"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appUtils_1 = require("../../src/lib/appUtils");
const chai_1 = require("chai");
const testing_1 = require("@iobroker/testing");
const { adapter } = testing_1.utils.unit.createMocks({});
describe("checkOneLineValue", () => {
    it("should add a row splitter to the end of the text if it doesn't already contain one", () => {
        const result = (0, appUtils_1.checkOneLineValue)("Hello this is a test");
        (0, chai_1.expect)(result).to.equal("Hello this is a test &&");
    });
    it("should not add a row splitter if the text already contains one", () => {
        const result = (0, appUtils_1.checkOneLineValue)("Hello this is a test &&");
        (0, chai_1.expect)(result).to.equal("Hello this is a test &&");
    });
});
describe('calcValue', () => {
    it('should calculate a valid mathematical expression', () => {
        const textToSend = 'Test {math:+5}';
        const val = '10';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test',
            val: 15,
            error: false,
        });
    });
    it('should return the original text and value if the expression is invalid', () => {
        const textToSend = 'Test {math:+}';
        const val = '10';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test',
            val: '10',
            error: true,
        });
    });
    it('should handle empty input gracefully', () => {
        const textToSend = '';
        const val = '';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: '',
            val: '',
            error: false,
        });
    });
    it('should return the original text if no math expression is found', () => {
        const textToSend = 'No math here';
        const val = '10';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'No math here',
            val: 10,
            error: false,
        });
    });
    it('should handle complex expressions correctly', () => {
        const textToSend = 'Test {math:*2} test';
        const val = '5';
        const result = (0, appUtils_1.calcValue)(textToSend, val, adapter);
        (0, chai_1.expect)(result).to.deep.equal({
            textToSend: 'Test  test',
            val: 10,
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
            val: '123.46',
            textToSend: 'Test',
            error: false,
        });
    });
    it('should handle invalid decimal places gracefully', () => {
        const val = '123.4567';
        const textToSend = 'Test {round:invalid}';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            val: '123.4567',
            textToSend: 'Test',
            error: true,
        });
    });
    it('should handle empty input gracefully', () => {
        const val = '';
        const textToSend = '';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            val: 'NaN',
            textToSend: '',
            error: true,
        });
    });
    it('should return an error if the value is not a valid number', () => {
        const val = 'invalid';
        const textToSend = 'Test {round:2}';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            val: 'NaN',
            textToSend: 'Test',
            error: true,
        });
    });
    it('should handle text without a round command', () => {
        const val = '123.4567';
        const textToSend = 'No round here';
        const result = (0, appUtils_1.roundValue)(val, textToSend);
        (0, chai_1.expect)(result).to.deep.equal({
            val: '123.4567',
            textToSend: 'No round here',
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
        const result = (0, appUtils_1.getTypeofTimestamp)("");
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
            shouldChange: true,
        });
    });
    it('should parse id and shouldChange correctly when oldWithId is not present', () => {
        const input = '"test.0.test":true';
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: 'test.0.test',
            shouldChange: true,
        });
    });
    it('should handle input with missing shouldChange value', () => {
        const input = "'id':'test.0.test':";
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: 'test.0.test',
            shouldChange: false,
        });
    });
    it('should handle input with missing id value', () => {
        const input = ":true";
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: '',
            shouldChange: true,
        });
    });
    it('should handle empty input gracefully', () => {
        const input = ':';
        const result = (0, appUtils_1.statusIdAndParams)(input);
        (0, chai_1.expect)(result).to.deep.equal({
            id: '',
            shouldChange: false,
        });
    });
});
//# sourceMappingURL=appUtils.test.js.map