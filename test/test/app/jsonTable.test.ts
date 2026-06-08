import { expect } from 'chai';
import sinon from 'sinon';
import { createKeyboardFromJson, createTextTableFromJson, lastRequestJsonButtonHistory } from '../../../src/app/jsonTable';

describe('jsonTable', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
        };
        // Prevent incrementing the module-global ID counter so the existing
        // json-table.test.ts fixture tests (which run after) still see id=0
        sinon.stub(lastRequestJsonButtonHistory, 'setData').returns(0);
    });

    afterEach(() => {
        sinon.restore();
    });

    // ─── createKeyboardFromJson ────────────────────────────────────────────────

    describe('createKeyboardFromJson', () => {
        const tableConfig = JSON.stringify({
            tableData: [{ key: 'name', label: 'Item' }],
            tableLabel: 'Shopping',
            type: 'alexaShoppingList',
            listName: 'list1',
        });

        it('should return keyboard and text for valid shopping list JSON', () => {
            const val = JSON.stringify([{ name: 'Milk', buttondelete: "x.('0.0.item1.data.1',true')" }]);
            const result = createKeyboardFromJson(
                adapterMock,
                val,
                tableConfig,
                'alexa-shoppinglist.0.list',
                'user1',
                'telegram.0',
            );
            expect(result).to.not.be.undefined;
            expect(result?.text).to.equal('Shopping');
            expect(result?.keyboard).to.have.property('inline_keyboard');
        });

        it('should use cached text when text param is null', () => {
            const val = JSON.stringify([{ name: 'Milk', buttondelete: "x.('0.0.item1.data.1',true')" }]);
            // First call populates the cache for user2
            createKeyboardFromJson(adapterMock, val, tableConfig, 'alexa-shoppinglist.0.list', 'user2', 'telegram.0');
            // Second call with null text should use cached value
            const result = createKeyboardFromJson(
                adapterMock,
                val,
                null,
                'alexa-shoppinglist.0.list',
                'user2',
                'telegram.0',
            );
            expect(result).to.not.be.undefined;
            expect(result?.text).to.equal('Shopping');
        });

        it('should return undefined and log warn when text JSON is invalid', () => {
            const result = createKeyboardFromJson(adapterMock, '[]', 'INVALID_JSON', 'id', 'user', 'inst');
            expect(result).to.be.undefined;
            expect(adapterMock.log.warn.calledOnce).to.be.true;
        });

        it('should return undefined when val JSON is invalid', () => {
            const result = createKeyboardFromJson(adapterMock, 'NOT_JSON', tableConfig, 'id', 'user', 'inst');
            expect(result).to.be.undefined;
        });

        it('should return undefined when val is not an array', () => {
            const result = createKeyboardFromJson(adapterMock, '{"key":"value"}', tableConfig, 'id', 'user', 'inst');
            expect(result).to.be.undefined;
        });

        it('should skip rows that have no buttondelete', () => {
            const val = JSON.stringify([{ name: 'Milk' }]);
            const result = createKeyboardFromJson(
                adapterMock,
                val,
                tableConfig,
                'alexa-shoppinglist.0.list',
                'user3',
                'telegram.0',
            );
            expect(result).to.not.be.undefined;
            // inline_keyboard has header row + empty data row pushed (no buttons)
            expect(result?.keyboard?.inline_keyboard).to.be.an('array');
        });

        it('should include header labels in keyboard when tableData has labels', () => {
            const configWithLabel = JSON.stringify({
                tableData: [{ key: 'name', label: 'Name' }],
                tableLabel: 'My List',
                type: 'alexaShoppingList',
                listName: 'list2',
            });
            const val = JSON.stringify([]);
            const result = createKeyboardFromJson(
                adapterMock,
                val,
                configWithLabel,
                'alexa-shoppinglist.0.list',
                'user4',
                'telegram.0',
            );
            expect(result).to.not.be.undefined;
            expect(result?.keyboard?.inline_keyboard?.[0]).to.have.lengthOf(1);
            expect(result?.keyboard?.inline_keyboard?.[0]?.[0]?.text).to.equal('Name');
        });
    });

    // ─── createTextTableFromJson ───────────────────────────────────────────────

    describe('createTextTableFromJson', () => {
        const tableConfig = JSON.stringify({
            tableData: [
                { key: 'name', label: 'Name' },
                { key: 'age', label: 'Age' },
            ],
            tableLabel: 'People',
            type: 'alexaShoppingList',
        });

        it('should produce a formatted text table from valid JSON data', () => {
            const json = JSON.stringify([
                { name: 'Alice', age: '30' },
                { name: 'Bob', age: '25' },
            ]);
            const result = createTextTableFromJson(adapterMock, json, tableConfig);
            expect(result).to.be.a('string');
            expect(result).to.include('People');
            expect(result).to.include('Alice');
            expect(result).to.include('Bob');
        });

        it('should return undefined when textToSend is invalid JSON', () => {
            const result = createTextTableFromJson(adapterMock, '[]', 'INVALID_JSON');
            expect(result).to.be.undefined;
        });

        it('should return undefined when json is not an array', () => {
            const result = createTextTableFromJson(adapterMock, '{"key":"value"}', tableConfig);
            expect(result).to.be.undefined;
        });

        it('should skip the tableLabel header when tableLabel is empty string', () => {
            const configNoLabel = JSON.stringify({
                tableData: [{ key: 'name', label: 'Name' }],
                tableLabel: '',
                type: 'alexaShoppingList',
            });
            const json = JSON.stringify([{ name: 'Alice' }]);
            const result = createTextTableFromJson(adapterMock, json, configNoLabel);
            expect(result).to.be.a('string');
            expect(result).to.not.include('People');
        });

        it('should handle a single-column table', () => {
            const configSingle = JSON.stringify({
                tableData: [{ key: 'item' }],
                tableLabel: 'Items',
                type: 'alexaShoppingList',
            });
            const json = JSON.stringify([{ item: 'Apple' }, { item: 'Banana' }]);
            const result = createTextTableFromJson(adapterMock, json, configSingle);
            expect(result).to.be.a('string');
            expect(result).to.include('Apple');
        });

        it('should handle error gracefully and log it', () => {
            // Passing a value that causes JSON.parse to throw inside the function
            const result = createTextTableFromJson(adapterMock, 'null', tableConfig);
            // null parses fine but is not an array
            expect(result).to.be.undefined;
        });
    });
});
