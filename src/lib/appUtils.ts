import { config } from '@b/config/config';
import type {
    Adapter,
    DataObject,
    GetTimeWithPad,
    Navigation,
    NewObjectStructure,
    ParseModeType,
    splittedNavigation,
    StartSides,
} from '@b/types/types';
import { decomposeText, removeQuotes } from '@b/lib/string';
import { evaluate } from '@b/lib/math';
import { isTruthy } from '@b/lib/utils';
import { trimAllItems } from '@b/lib/object';
import type { RowsNav, MenusWithUsers } from '@/types/app';

export const checkOneLineValue = (text: string): string =>
    !text.includes(config.rowSplitter) ? `${text} ${config.rowSplitter}` : text;

/**
 * Math Function
 * Calculates mathematical expressions within the textToSend using the provided value.
 *
 * @param textToSend Text to send
 * @param val Value to calculate
 * @param adapter Adapter instance
 */
export function mathFunction(
    textToSend: string,
    val: string,
    adapter: Adapter,
): { textToSend: string; calculated: any; error: boolean } {
    if (!textToSend.includes('{math:')) {
        return { textToSend, calculated: val, error: false };
    }

    const { substringExcludeSearch, textExcludeSubstring } = decomposeText(textToSend, '{math:', '}');
    const { val: evalVal, error } = evaluate([val, substringExcludeSearch], adapter);

    return error
        ? { textToSend: textExcludeSubstring, calculated: val, error }
        : { textToSend: textExcludeSubstring, calculated: evalVal, error };
}

export function roundValue(val: string, textToSend: string): { roundedValue: string; text: string; error: boolean } {
    const floatVal = parseFloat(val);
    const { textExcludeSubstring, substringExcludeSearch: decimalPlaces } = decomposeText(
        textToSend,
        config.round.start,
        config.round.end,
    );
    const decimalPlacesNum = parseInt(decimalPlaces);

    if (isNaN(floatVal)) {
        return { roundedValue: 'NaN', text: textExcludeSubstring, error: true };
    }
    if (isNaN(decimalPlacesNum)) {
        return { roundedValue: val, text: textExcludeSubstring, error: true };
    }

    return { roundedValue: floatVal.toFixed(decimalPlacesNum), text: textExcludeSubstring, error: false };
}

export const getListOfMenusIncludingUser = (menusWithUsers: MenusWithUsers, userToSend: string): string[] => {
    const menus: string[] = [];
    for (const key in menusWithUsers) {
        if (menusWithUsers[key]?.some(item => item.name === userToSend)) {
            menus.push(key);
        }
    }
    return menus;
};

export const getParseMode = (val = false): ParseModeType => (val ? 'HTML' : 'Markdown');

export const getTypeofTimestamp = (val: string): 'lc' | 'ts' => (val.includes('lc') ? 'lc' : 'ts');

export const timeStringReplacer = ({ d, h, m, ms, y, s, mo }: GetTimeWithPad, string?: string): string | undefined => {
    if (string) {
        string = string
            .replace('sss', ms)
            .replace('ss', s)
            .replace('mm', m)
            .replace('hh', h)
            .replace('DD', d)
            .replace('MM', mo)
            .replace('YYYY', y)
            .replace('YY', y.slice(-2))
            .replace('(', '')
            .replace(')', '');
    }
    return string;
};

export function statusIdAndParams(substringExcludeSearch: string): {
    id: string;
    shouldChangeByStatusParameter: boolean;
} {
    const splitArray = substringExcludeSearch.split(':');
    const firstEl = splitArray[0];
    const secondEl = splitArray[1] ?? '';
    const thirdEl = splitArray[2] ?? '';
    return substringExcludeSearch.includes(config.status.oldWithId)
        ? {
              id: removeQuotes(secondEl), //'id':'ID':true
              shouldChangeByStatusParameter: isTruthy(removeQuotes(thirdEl)),
          }
        : {
              id: removeQuotes(firstEl), //'ID':true
              shouldChangeByStatusParameter: isTruthy(removeQuotes(secondEl)),
          };
}

export function isStartside(startSide: string): boolean {
    return startSide != '-' && startSide != '';
}

export function splitNavigation(rows: RowsNav[]): splittedNavigation[] {
    const generatedNavigation: splittedNavigation[] = [];

    rows.forEach(({ value, text, parse_mode, call }) => {
        const nav: Navigation = [];

        checkOneLineValue(value)
            .split(config.rowSplitter)
            .forEach(function (el, index: number) {
                nav[index] = trimAllItems(el.split(','));
            });

        generatedNavigation.push({ call, text, parse_mode: isTruthy(parse_mode), nav });
    });
    return generatedNavigation;
}

export function getNewStructure(val: splittedNavigation[]): NewObjectStructure {
    const obj: NewObjectStructure = {};
    val.forEach(function ({ nav, text, parse_mode, call }) {
        obj[call] = { nav, text, parse_mode };
    });
    return obj;
}

export const getStartSides = (menusWithUsers: MenusWithUsers, dataObject: DataObject): StartSides => {
    const startSides: StartSides = {};
    Object.keys(menusWithUsers).forEach(element => {
        startSides[element] = dataObject.nav[element][0].call;
    });
    return startSides;
};

export function isSameType(
    receivedType: 'undefined' | 'object' | 'boolean' | 'number' | 'string' | 'function' | 'symbol' | 'bigint',
    obj: ioBroker.Object,
): boolean {
    return receivedType === obj.common.type;
}

export const getInstanceById = (id: string): { instanceName: string; instanceNumber: string; instance: string } => {
    const obj = id.split('.');
    return { instanceName: obj[0], instanceNumber: obj[1], instance: obj.slice(0, 2).join('.') };
};
