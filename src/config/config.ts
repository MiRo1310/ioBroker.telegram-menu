import type { GenerateActionsArrayOfEntries } from '../types/types';

export const defaultLocale = 'de-DE';
export const timezone = 'Europe/Berlin';
export const backMenuLength = 20;

export const invalidId = 'Invalid ID';

export const config = {
    time: '{time}',
    change: {
        start: 'change{',
        end: '}',
        command: 'change',
    },
    rowSplitter: '&&',
    math: {
        start: '{math:',
        end: '}',
    },
    round: {
        start: '{round:',
        end: '}',
    },
    timestamp: {
        start: '{time.',
        end: '}',
        lc: '{time.lc',
        ts: '{time.ts',
    },
    status: {
        start: '{status:',
        end: '}',
        oldWithId: "'id':",
    },
    set: {
        start: '{set:',
        end: '}',
    },
    json: {
        start: '{json',
        end: '}',
        textTable: 'TextTable',
    },
    binding: {
        start: 'binding:{',
        end: '}',
        splitChar: ';',
    },
    functionSelektor: 'functions=',
    modifiedValue: '{value}',
    dynamicValue: {
        start: '{id:',
        end: '}',
    },
    setDynamicValue: '{setDynamicValue',
};

export const arrayOfEntries: GenerateActionsArrayOfEntries[] = [
    {
        objName: 'echarts',
        name: 'echarts',
        loop: 'preset',
        elements: [
            { name: 'preset' },
            { name: 'echartInstance' },
            { name: 'background' },
            { name: 'theme' },
            { name: 'filename' },
        ],
    },
    {
        objName: 'loc',
        name: 'location',
        loop: 'latitude',
        elements: [{ name: 'latitude' }, { name: 'longitude' }, { name: 'parse_mode', index: 0 }],
    },
    {
        objName: 'pic',
        name: 'sendPic',
        loop: 'IDs',
        elements: [{ name: 'id', value: 'IDs' }, { name: 'fileName' }, { name: 'delay', value: 'picSendDelay' }],
    },
    {
        objName: 'get',
        name: 'getData',
        loop: 'IDs',
        elements: [
            { name: 'id', value: 'IDs' },
            { name: 'text', type: 'text' },
            { name: 'newline', value: 'newline_checkbox' },
            { name: 'parse_mode', index: 0 },
        ],
    },
    {
        objName: 'httpRequest',
        name: 'httpRequest',
        loop: 'url',
        elements: [{ name: 'url' }, { name: 'user' }, { name: 'password' }, { name: 'filename' }],
    },
];
