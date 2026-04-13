import { describe } from 'mocha';
import fs from 'fs';
import { expect } from 'chai';
import { createTextTableFromJson } from '@backend/app/jsonTable';
import { utils } from '@iobroker/testing';
import type { Adapter } from '@backend/types/types';
import { jsonTextTableResponse } from '../fixtures/jsonTextTableResponse';
const { adapter } = utils.unit.createMocks({});
const mockAdapter = adapter as unknown as Adapter;

describe('JsonTables', () => {
    it('should generate correct text table', () => {
        const textFromUser =
            '{"tableData":[{ "key": "Pollen","label": "Pollen" },{ "key": "Riskindex" },{ "key": "Riskindextext"}],"tableLabel": "Einkaufsliste","listName": "SHOP","type": "TextTable"}';
        const data = fs.readFileSync('test/fixtures/jsonTable.json', 'utf8');

        const result = createTextTableFromJson(mockAdapter, data, textFromUser);
        expect(result).to.deep.equal(jsonTextTableResponse);
    });
});
