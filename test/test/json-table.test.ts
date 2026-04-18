import { describe } from 'mocha';
import fs from 'fs';
import { expect } from 'chai';
import { createKeyboardFromJson, createTextTableFromJson } from '@backend/app/jsonTable';
import { utils } from '@iobroker/testing';
import type { Adapter } from '@backend/types/types';
import { jsonTextTableResponse } from '../fixtures/jsonTextTableResponse';

const { adapter } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('JsonTables', () => {
    it('should generate correct text table', () => {
        const textFromUser =
            '{"tableData":[{"key":"Pollen","label":"Pollen" },{"key":"Riskindex"},{"key":"Riskindextext"}],"tableLabel":"Einkaufsliste","listName":"SHOP","type":"TextTable"}';
        const data = fs.readFileSync('test/fixtures/jsonTable.json', 'utf8');

        const result = createTextTableFromJson(mockAdapter, data, textFromUser);
        expect(result).to.deep.equal(jsonTextTableResponse);
    });

    it('should generate correct button table from json table', () => {
        const testFromUser =
            '{"tableData":[{"key":"name"}],"tableLabel":"ShoppingList","listName":"SHOP","type":"alexaShoppingList"}';
        const id = 'alexa-shoppinglist.0.list_activ';
        const shoppingList = fs.readFileSync('test/fixtures/alexa-shopping-list.json', 'utf8');
        const result = createKeyboardFromJson(mockAdapter, shoppingList, testFromUser, id, 'Michael', 'telegram.0');
        expect(result).to.deep.equal(JSON.parse(fs.readFileSync('test/fixtures/telegram-shopping-list.json', 'utf8')));
    });

    it('should generate correct button table from json table with more cols', () => {
        const testFromUser =
            '{"tableData":[{"key":"name"},{"key":"time"}],"tableLabel":"ShoppingList","listName":"SHOP","type":"alexaShoppingList"}';
        const id = 'alexa-shoppinglist.0.list_activ';
        const shoppingList = fs.readFileSync('test/fixtures/alexa-shopping-list.json', 'utf8');
        const result = createKeyboardFromJson(mockAdapter, shoppingList, testFromUser, id, 'Michael', 'telegram.0');
        expect(result).to.deep.equal(
            JSON.parse(fs.readFileSync('test/fixtures/telegram-shopping-list-more-cols.json', 'utf8')),
        );
    });

    it('should generate correct button table from json table with more cols', () => {
        const testFromUser =
            '{"tableData":[{"key":"name","label":"Name"},{"key":"time","label":"Zeit"}],"tableLabel":"ShoppingList","listName":"SHOP","type":"alexaShoppingList"}';
        const id = 'alexa-shoppinglist.0.list_activ';
        const shoppingList = fs.readFileSync('test/fixtures/alexa-shopping-list.json', 'utf8');
        const result = createKeyboardFromJson(mockAdapter, shoppingList, testFromUser, id, 'Michael', 'telegram.0');
        expect(result).to.deep.equal(
            JSON.parse(fs.readFileSync('test/fixtures/telegram-shopping-list-more-cols-and-label.json', 'utf8')),
        );
    });
});
