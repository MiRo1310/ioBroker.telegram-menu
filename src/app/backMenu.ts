import { errorLogger } from './logging';
import type { BackMenu, Keyboard, MenuData, Navigation } from '../types/types';
import { checkStatusInfo } from '../lib/utilities';
import { adapter } from '../main';
import { jsonString } from '../lib/string';
import { backMenuLength } from '../config/config';

const backMenu: BackMenu = {};

export function backMenuFunc({
    activePage,
    navigation,
    userToSend,
}: {
    activePage: string;
    navigation?: Navigation;
    userToSend: string;
}): void {
    if (!navigation || !jsonString(navigation).split(`"`)[1].includes('menu:')) {
        const list = backMenu[userToSend]?.list;
        const lastMenu = backMenu[userToSend]?.last;

        if (list?.length === backMenuLength) {
            list.shift();
        }
        if (!backMenu[userToSend]) {
            backMenu[userToSend] = { list: [], last: '' };
        }

        if (lastMenu && lastMenu !== '' && list) {
            list.push(lastMenu);
        }
        backMenu[userToSend].last = activePage;
    }
}

export async function switchBack(
    userToSend: string,
    allMenusWithData: MenuData,
    menus: string[],
    lastMenu = false,
): Promise<{ textToSend: string | undefined; keyboard: Keyboard; parse_mode: boolean | undefined } | undefined> {
    try {
        const list = backMenu[userToSend]?.list ? backMenu[userToSend].list : [];
        const lastListElement = list[list.length - 1];
        const lastElement = backMenu[userToSend]?.last;
        let keyboard: Keyboard;
        let foundedMenu = '';

        if (list.length) {
            for (const menu of menus) {
                const nav = lastElement ? allMenusWithData[menu]?.[lastElement]?.nav : undefined;
                const navBefore = allMenusWithData[menu]?.[lastListElement]?.nav;

                if (lastMenu && nav) {
                    keyboard = nav;
                    foundedMenu = menu;
                    break;
                } else if (navBefore && !lastMenu) {
                    keyboard = navBefore;
                    foundedMenu = menu;
                    break;
                }

                adapter.log.debug(`Menu call not found in this Menu: ${menu}`);
            }

            if (keyboard && foundedMenu != '') {
                if (!lastMenu) {
                    const list = backMenu[userToSend]?.list;
                    const listLength = list ? list.length - 1 : 0;
                    const lastListElement = list?.[listLength];
                    if (!lastListElement) {
                        return;
                    }
                    const { text, parse_mode } = allMenusWithData[foundedMenu][lastListElement];
                    let textToSend = text;
                    if (textToSend) {
                        textToSend = await checkStatusInfo(textToSend);
                    }
                    if (backMenu[userToSend]?.last) {
                        backMenu[userToSend].last = list.pop() ?? '';
                    }

                    return { textToSend, keyboard, parse_mode };
                }

                const lastElement = backMenu[userToSend]?.last;
                if (!lastElement) {
                    return;
                }
                const { parse_mode, text: textToSend } = allMenusWithData[foundedMenu][lastElement];

                return { textToSend, keyboard, parse_mode };
            }
        }
    } catch (e: any) {
        errorLogger('Error in switchBack:', e, adapter);
    }
}
