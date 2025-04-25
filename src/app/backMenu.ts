import { errorLogger } from './logging';
import type { BackMenu, Navigation, MenuData, Keyboard } from '../types/types';
import { checkStatusInfo } from '../lib/utilities';
import { adapter } from '../main';
import { jsonString } from '../lib/string';

const backMenu: BackMenu = {};

export function backMenuFunc({ nav, part, userToSend }: { nav: string; part?: Navigation; userToSend: string }): void {
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

    adapter.log.debug(`BackMenu: ${jsonString(backMenu)}`);
}

export async function switchBack(
    userToSend: string,
    allMenusWithData: MenuData,
    menus: string[],
    lastMenu = false,
): Promise<{ texttosend: string | undefined; menuToSend: Keyboard; parse_mode: boolean } | undefined> {
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
                    adapter.log.debug('Menu call found');
                    foundedMenu = menu;
                    break;
                }

                adapter.log.debug(`Menu call not found in this Menu: ${menu}`);
            }
            if (keyboard && foundedMenu != '') {
                let parse_mode = false;
                if (!lastMenu) {
                    let textToSend =
                        allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]]
                            .text;
                    if (textToSend) {
                        textToSend = await checkStatusInfo(textToSend);
                    }
                    parse_mode =
                        allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]]
                            .parse_mode ?? false;
                    backMenu[userToSend].last = list.pop();

                    return { texttosend: textToSend, menuToSend: keyboard, parse_mode };
                }
                parse_mode = allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode ?? false;
                return {
                    texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text as string,
                    menuToSend: keyboard,
                    parse_mode,
                };
            }
        }
    } catch (e: any) {
        errorLogger('Error in switchBack:', e, adapter);
    }
}
