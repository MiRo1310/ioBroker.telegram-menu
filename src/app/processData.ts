import type { IDynamicValue, MenuData, NewObjectStructure, Part, Timeouts } from '@backend/types/types';
import { jsonString } from '@backend/lib/string';
import { adjustValueType } from '@backend/app/action';
import { buildReturnText, handleSetState, setstateIobroker } from '@backend/app/setstate';
import { sendLocationToTelegram, sendToTelegram } from '@backend/app/telegram';
import { sendNav } from '@backend/app/sendNav';
import { callSubMenu } from '@backend/app/subMenu';
import { getState } from '@backend/app/getstate';
import { sendPic } from '@backend/app/sendpic';
import { getChart } from '@backend/app/echarts';
import { httpRequest } from '@backend/app/httpRequest';
import { isSubmenuOrMenu } from '@backend/app/validateMenus';
import { dynamicValue } from '@backend/app/dynamicValue';
import type TelegramMenu from '@backend/main';
import type { AppContext } from '@backend/app/appContext';

export class MenuProcessor {
    private timeouts: Timeouts[] = [];
    private readonly adapter: TelegramMenu;

    constructor(
        private appContext: AppContext,
        private menuData: MenuData,
        private navToGoTo: string,
        private menus: string[],
        private timeoutKey: string,
        private userToSend: string,
        private instance: string,
    ) {
        this.adapter = this.appContext.adapter;
    }

    public async checkEveryMenuForData(): Promise<boolean> {
        for (const menu of this.menus) {
            const groupData = this.menuData[menu];

            if (await this.processData(menu, groupData)) {
                this.adapter.log.debug(`Menu found: ${menu}`);
                return true;
            }
        }
        return false;
    }

    public getTimeouts(): Timeouts[] {
        return this.timeouts;
    }

    private async processData(groupWithUser: string, groupData: NewObjectStructure): Promise<boolean | undefined> {
        let part: Part | undefined = undefined;

        const dynamicValueObject = dynamicValue.getValue(this.userToSend);

        if (dynamicValueObject) {
            return await this.handleDynamicValue(dynamicValueObject, part);
        }

        const call = this.navToGoTo.includes('menu:') ? this.navToGoTo.split(':')[2] : this.navToGoTo;
        part = groupData?.[call];

        if (!this.navToGoTo.includes('menu:') && this.appContext.isUserActiveCheckbox[groupWithUser]) {
            const nav = part?.nav;
            if (nav) {
                return await this.dispatchNavAction(nav, call, part);
            }

            if (await this.dispatchPartAction(part)) {
                return true;
            }
        }

        if (isSubmenuOrMenu(this.navToGoTo) && this.menuData[groupWithUser]?.[call]) {
            this.adapter.log.debug('Call Submenu');
            await callSubMenu({
                appContext: this.appContext,
                instance: this.instance,
                jsonStringNav: this.navToGoTo,
                userToSend: this.userToSend,
                part,
                allMenusWithData: this.menuData,
                menus: this.menus,
            });
            return true;
        }

        return false;
    }

    private async dispatchPartAction(part: Part): Promise<boolean> {
        if (part?.switch) {
            await handleSetState(this.appContext, this.instance, part, this.userToSend, null);
            return true;
        }

        if (part?.getData) {
            await getState(this.instance, part, this.userToSend, this.appContext);
            return true;
        }

        if (part?.sendPic) {
            this.timeouts = sendPic(
                this.appContext,
                this.instance,
                part,
                this.userToSend,
                this.timeouts,
                this.timeoutKey,
            );
            return true;
        }

        if (part?.location) {
            this.adapter.log.debug('Send location');
            await sendLocationToTelegram(this.instance, this.userToSend, part.location, this.appContext);
            return true;
        }

        if (part?.echarts) {
            this.adapter.log.debug('Send echarts');
            getChart(this.instance, part.echarts, this.userToSend, this.appContext);
            return true;
        }

        if (part?.httpRequest) {
            this.adapter.log.debug('Send http request');
            return await httpRequest(this.appContext, this.instance, part, this.userToSend);
        }
        return false;
    }

    private async dispatchNavAction(nav: string[][], call: string, part: Part): Promise<boolean> {
        this.adapter.log.debug(`Menu to Send: ${jsonString(nav)}`);
        this.appContext.backMenuRegistry.backMenuFunc({
            activePage: call,
            navigation: nav,
            userToSend: this.userToSend,
        });

        if (jsonString(nav).includes('menu:')) {
            this.adapter.log.debug(`Submenu: ${jsonString(nav)}`);
            const result = await callSubMenu({
                appContext: this.appContext,
                instance: this.instance,
                jsonStringNav: jsonString(nav),
                userToSend: this.userToSend,
                part,
                allMenusWithData: this.menuData,
                menus: this.menus,
            });
            if (result?.newNav) {
                this.navToGoTo = result.newNav;
                await this.checkEveryMenuForData();
            }
            return true;
        }

        await sendNav(this.appContext, this.instance, part, this.userToSend);
        return true;
    }

    private async handleDynamicValue(dynamicValueObject: IDynamicValue, part: undefined): Promise<boolean> {
        const valueToSet = dynamicValueObject.valueType
            ? adjustValueType(this.adapter, this.navToGoTo, dynamicValueObject.valueType)
            : this.navToGoTo;

        if (valueToSet && dynamicValueObject.idToSet) {
            await setstateIobroker(this.appContext, dynamicValueObject.idToSet, valueToSet, dynamicValueObject.ack);
            if (dynamicValueObject.confirm && this.onlyConfirmIfWatchIdIsNotSet(dynamicValueObject)) {
                const text = await buildReturnText(this.appContext, dynamicValueObject.returnText, valueToSet);

                await sendToTelegram({
                    instance: this.instance,
                    userToSend: this.userToSend,
                    textToSend: text,
                    appContext: this.appContext,
                });
            }
        } else {
            await sendToTelegram({
                instance: this.instance,
                userToSend: this.userToSend,
                textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValueObject.valueType}`,
                appContext: this.appContext,
            });
        }

        dynamicValue.removeUser(this.userToSend);
        const result = await this.appContext.backMenuRegistry.switchBack(
            this.adapter,
            this.userToSend,
            this.menuData,
            this.menus,
            true,
        );

        if (result && !dynamicValueObject.watchForId) {
            const { textToSend, keyboard, parse_mode } = result;
            await sendToTelegram({
                instance: this.instance,
                userToSend: this.userToSend,
                textToSend,
                keyboard,
                appContext: this.appContext,
                parse_mode,
            });
            return true;
        }

        await sendNav(this.appContext, this.instance, part, this.userToSend);
        return true;
    }

    private onlyConfirmIfWatchIdIsNotSet(dynamicValueObject: IDynamicValue): boolean {
        return !dynamicValueObject.watchForId;
    }
}
