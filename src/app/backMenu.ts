import { backMenuLength } from '@backend/config/config';
import type { Adapter, BackMenu, MenuData, Navigation } from '@backend/types/types';
import { textModifier } from '@backend/lib/utilities';
import { jsonString } from '@backend/lib/string';
import type { AppContext } from '@backend/app/appContext';

export class BackMenuRegistry {
    private backMenu: BackMenu = {};

    constructor(private appContext: AppContext) {}

    public async switchBack(
        adapter: Adapter,
        userToSend: string,
        allMenusWithData: MenuData,
        menus: string[],
        lastMenu = false,
    ): Promise<{ textToSend: string | undefined; keyboard: string[][]; parse_mode: boolean | undefined } | undefined> {
        const list = this.backMenu[userToSend]?.list ?? [];
        const lastListElement = list[list.length - 1];
        const lastElement = this.backMenu[userToSend]?.last;
        let keyboard: string[][] = [];
        let foundedMenu = '';

        if (list.length) {
            for (const menu of menus) {
                /* istanbul ignore next */
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
                    const list = this.backMenu[userToSend]?.list;
                    /* istanbul ignore next */
                    const listLength = list ? list.length - 1 : 0;
                    const lastListElement = list?.[listLength];
                    /* istanbul ignore next */
                    if (!lastListElement) {
                        return;
                    }
                    const { text, parse_mode } = allMenusWithData[foundedMenu][lastListElement];
                    let textToSend = text;
                    if (textToSend) {
                        textToSend = await textModifier(this.appContext, textToSend);
                    }

                    if (this.backMenu[userToSend]?.last) {
                        /* istanbul ignore next */
                        this.backMenu[userToSend].last = list.pop() ?? '';
                    }

                    return { textToSend, keyboard, parse_mode };
                }

                const lastElement = this.backMenu[userToSend]?.last;
                /* istanbul ignore next */
                if (!lastElement) {
                    return;
                }
                const { parse_mode, text: textToSend } = allMenusWithData[foundedMenu][lastElement];

                return { textToSend, keyboard, parse_mode };
            }
        }
    }

    public backMenuFunc({
        activePage,
        navigation,
        userToSend,
    }: {
        activePage: string;
        navigation?: Navigation;
        userToSend: string;
    }): void {
        if (!navigation || !jsonString(navigation).split(`"`)[1].includes('menu:')) {
            const list = this.backMenu[userToSend]?.list;
            const lastMenu = this.backMenu[userToSend]?.last;

            if (list?.length === backMenuLength) {
                list.shift();
            }
            if (!this.backMenu[userToSend] || !this.backMenu[userToSend]?.last) {
                this.backMenu[userToSend] = { list: [], last: '' };
            }

            if (lastMenu && lastMenu !== '' && list) {
                list.push(lastMenu);
            }
            this.backMenu[userToSend].last = activePage;
        }
    }
}
