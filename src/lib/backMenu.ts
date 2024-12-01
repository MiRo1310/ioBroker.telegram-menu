import { debug, error } from './logging';
import type { BackMenu, NavPart, AllMenusWithData, BooleanString } from './telegram-menu';
import { checkStatusInfo } from './utilities';
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
): Promise<{ texttosend: string | undefined; menuToSend: NavPart; parseMode: BooleanString } | undefined> {
    try {
        const list = backMenu[userToSend] && backMenu[userToSend]?.list ? backMenu[userToSend].list : [];
        let menuToSend: NavPart | undefined = [];
        let foundedMenu = '';
        if (list.length != 0) {
            for (const menu of menus) {
                if (lastMenu && allMenusWithData[menu]?.[backMenu[userToSend].last]?.nav) {
                    menuToSend = allMenusWithData[menu][backMenu[userToSend].last].nav;
                    foundedMenu = menu;
                    break;
                } else if (allMenusWithData[menu][list[list.length - 1]]?.nav && !lastMenu) {
                    menuToSend = allMenusWithData[menu][list[list.length - 1]].nav;
                    debug([{ text: 'Menu call found' }]);
                    foundedMenu = menu;
                    break;
                }
                debug([{ text: 'Menu call not found in this Menu' }]);
            }
            if (menuToSend && foundedMenu != '') {
                let parseMode: BooleanString = '' as BooleanString;
                if (!lastMenu) {
                    let textToSend =
                        allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]]
                            .text;
                    if (textToSend) {
                        textToSend = await checkStatusInfo(textToSend);
                    }
                    parseMode =
                        allMenusWithData[foundedMenu][backMenu[userToSend].list[backMenu[userToSend].list.length - 1]]
                            .parse_mode || 'false';
                    backMenu[userToSend].last = list.pop();

                    return { texttosend: textToSend, menuToSend: menuToSend, parseMode: parseMode };
                }
                parseMode = allMenusWithData[foundedMenu][backMenu[userToSend].last].parse_mode || 'false';
                return {
                    texttosend: allMenusWithData[foundedMenu][backMenu[userToSend].last].text,
                    menuToSend: menuToSend,
                    parseMode: parseMode,
                };
            }
        }
    } catch (e: any) {
        error([
            { text: 'Error in switchBack:', val: e.message },
            { text: 'Stack:', val: e.stack },
        ]);
    }
}

export { switchBack, backMenuFunc };
