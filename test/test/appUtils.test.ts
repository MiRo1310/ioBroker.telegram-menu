import {
    calcValue,
    checkOneLineValue,
    getListOfMenusIncludingUser,
    getParseMode, getTypeofTimestamp,
    roundValue
} from "../../src/lib/appUtils";
import {expect} from "chai";
import {utils} from "@iobroker/testing";

const { adapter } = utils.unit.createMocks({});

describe("checkOneLineValue", () => {
    it("should add a row splitter to the end of the text if it doesn't already contain one", () => {
        const result = checkOneLineValue("Hello this is a test");
        expect(result).to.equal("Hello this is a test &&");
    });

    it("should not add a row splitter if the text already contains one", () => {
        const result = checkOneLineValue("Hello this is a test &&");
        expect(result).to.equal("Hello this is a test &&");
    });
})

describe('calcValue', () => {
    it('should calculate a valid mathematical expression', () => {
        const textToSend = 'Test {math:+5}';
        const val = '10';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
            textToSend: 'Test',
            val: 15,
            error: false,
        });
    });

    it('should return the original text and value if the expression is invalid', () => {
        const textToSend = 'Test {math:+}';
        const val = '10';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
            textToSend: 'Test',
            val: '10',
            error: true,
        });
    });

    it('should handle empty input gracefully', () => {
        const textToSend = '';
        const val = '';
        const result = calcValue(textToSend, val,adapter);
        expect(result).to.deep.equal({
            textToSend: '',
            val: '',
            error: false,
        });
    });

    it('should return the original text if no math expression is found', () => {
        const textToSend = 'No math here';
        const val = '10';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
            textToSend: 'No math here',
            val: 10,
            error: false,
        });
    });

    it('should handle complex expressions correctly', () => {
        const textToSend = 'Test {math:*2} test';
        const val = '5';
        const result = calcValue(textToSend, val, adapter);
        expect(result).to.deep.equal({
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
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            val: '123.46',
            textToSend: 'Test',
            error: false,
        });
    });

    it('should handle invalid decimal places gracefully', () => {
        const val = '123.4567';
        const textToSend = 'Test {round:invalid}';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            val: '123.4567',
            textToSend: 'Test',
            error: true,
        });
    });

    it('should handle empty input gracefully', () => {
        const val = '';
        const textToSend = '';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            val: 'NaN',
            textToSend: '',
            error: true,
        });
    });

    it('should return an error if the value is not a valid number', () => {
        const val = 'invalid';
        const textToSend = 'Test {round:2}';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
            val: 'NaN',
            textToSend: 'Test',
            error: true,
        });
    });

    it('should handle text without a round command', () => {
        const val = '123.4567';
        const textToSend = 'No round here';
        const result = roundValue(val, textToSend);
        expect(result).to.deep.equal({
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
        const result = getListOfMenusIncludingUser(menusWithUsers, userToSend);
        expect(result).to.deep.equal(['menu1', 'menu3']);
    });

    it('should return an empty array if no menus include the specified user', () => {
        const menusWithUsers = {
            menu1: ['user2'],
            menu2: ['user3'],
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
            menu1: ['user1', 'user2'],
            menu2: ['user3'],
        };
        const userToSend = '';
        const result = getListOfMenusIncludingUser(menusWithUsers, userToSend);
        expect(result).to.deep.equal([]);
    });

    it('should handle menus with empty user arrays', () => {
        const menusWithUsers = {
            menu1: [],
            menu2: ['user3'],
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
        const result = getTypeofTimestamp("");
        expect(result).to.equal('ts');
    });

    it('should return "ts" when the array contains unrelated values', () => {
        const result = getTypeofTimestamp('random value');
        expect(result).to.equal('ts');
    });
});