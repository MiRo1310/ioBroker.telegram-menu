import { debug, errorLogger } from './logging';
import type { BackMenu, NavPart, AllMenusWithData, BooleanString, Keyboard } from '../types/types';
import { checkStatusInfo } from '../lib/utilities';
const backMenu: BackMenu = {};

function backMenuFunc(nav: string, part: NavPart, userToSend: string): void {
    if (!part || !JSON.stringify(part).split(`"`)[1].includes('menu:')) {
        if (backMenu[userToSend] && backMenu[userToSend].list.length === 20) {
            backMenu[userToSend].list.shift();
        } else if (!backMenu[userToSend]) {
            backMenu[userToSend] = { list: [], last: '' };
        }
        if (backMenu[userToSend].last !== '') {
            backMenu[userToSend].list.push(backMenu[userToSend].last);
        }
        backMenu[userToSend].last = nav;
    }
    debug([{ text: 'GoBackMenu', val: backMenu }]);
}

async function switchBack(
    userToSend: string,
    allMenusWithData: AllMenusWithData,
    menus: string[],
    lastMenu = false,
): Promise<{ texttosend: string | undefined; menuToSend: Keyboard; parseMode: BooleanString } | undefined> {
    try {
        const list = backMenu[userToSend] && backMenu[userToSend]?.list ? backMenu[userToSend].list : [];
        let keyboard: Keyboard = { inline_keyboard: [] };
        let foundedMenu = '';
        if (list.length != 0) {
            for (const menu of menus) {
                if (lastMenu && allMenusWithData[menu]?.[backMenu[userToSend].last]?.nav) {
                    keyboard = allMenusWithData[menu][backMenu[userToSend].last].nav;
                    foundedMenu = menu;
                    break;
                } else if (allMenusWithData[menu][list[list.length - 1]]?.nav && !lastMenu) {
                    keyboard = allMenusWithData[menu][list[list.length - 1]].nav;
                    debug([{ text: 'Menu call found' }]);
                    foundedMenu = menu;
                    break;
                }
                debug([{ text: 'Menu call not found in this Menu' }]);
            }
            if (keyboard && foundedMenu != '') {
                let parseMode: BooleanString = '' as BooleanString;
                if (!lastMenu) {
                    let textToSend = allMenusWithData[foundedMenu][
                        backMenu[userToSend].list[backMenu[userToSend].list.length - 1]
                    ].text as string | undefined;
                    if (textToSend) {
                        textToSend = await checkStatusInfo(textToSend);
                    }
                    parseMode = (allMenusWithData[foundedMenu][
                        backMenu[userToSend].list[backMenu[userToSend].list.length - 1]
                    ].parse_mode || 'false') as BooleanString;
                    backMenu[userToSend].last = list.pop();

                    return { texttosend: textToSend, menuToSend: keyboard, parseMode: parseMode };
                }
                parseMode = (allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode ||
                    'false') as BooleanString;
                return {
                    texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text as string,
                    menuToSend: keyboard,
                    parseMode: parseMode,
                };
            }
        }
    } catch (e: any) {
        errorLogger('Error in switchBack:', e);
    }
}

export { switchBack, backMenuFunc };
