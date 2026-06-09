import type { IDynamicValue, MenuData, NewObjectStructure, Part, TelegramParams, Timeouts } from '@backend/types/types';
import { jsonString } from '@backend/lib/string';
import { adjustValueType } from '@backend/app/action';
import { exchangeValueAndSendToTelegram, handleSetState, setstateIobroker } from '@backend/app/setstate';
import { sendLocationToTelegram, sendToTelegram } from '@backend/app/telegram';
import { backMenuFunc, switchBack } from '@backend/app/backMenu';
import { sendNav } from '@backend/app/sendNav';
import { callSubMenu } from '@backend/app/subMenu';
import { getState } from '@backend/app/getstate';
import { sendPic } from '@backend/app/sendpic';
import { getChart } from '@backend/app/echarts';
import { httpRequest } from '@backend/app/httpRequest';
import { isSubmenuOrMenu } from '@backend/app/validateMenus';
import { errorLogger } from '@backend/app/logging';
import { dynamicValue } from '@backend/app/dynamicValue';
import type { UserActiveCheckbox } from '@/types/app';
import type TelegramMenu from '@backend/main';

export class MenuProcessor {
    private timeouts: Timeouts[] = [];
    private readonly adapter: TelegramMenu;

    constructor(
        private menuData: MenuData,
        private navToGoTo: string,
        private menus: string[],
        private isUserActiveCheckbox: UserActiveCheckbox,
        private token: string,
        private directoryPicture: string,
        private timeoutKey: string,
        private userToSend: string,
        private telegramParams: TelegramParams,
        private instance: string,
    ) {
        this.adapter = this.telegramParams.adapter;
    }

    public async checkEveryMenuForData(): Promise<boolean> {
        for (const menu of this.menus) {
            const groupData = this.menuData[menu];

            this.adapter.log.debug(`Menu : ${menu}`);
            this.adapter.log.debug(`Nav : ${jsonString(this.menuData[menu])}`);

            if (await this.processData(menu, groupData)) {
                this.adapter.log.debug('Menu found');
                return true;
            }
        }
        return false;
    }

    public getTimeouts(): Timeouts[] {
        return this.timeouts;
    }

    private async processData(groupWithUser: string, groupData: NewObjectStructure): Promise<boolean | undefined> {
        try {
            let part: Part | undefined = undefined;

            const dynamicValueObject = dynamicValue.getValue(this.userToSend);

            if (dynamicValueObject) {
                const valueToSet = dynamicValueObject.valueType
                    ? adjustValueType(this.adapter, this.navToGoTo, dynamicValueObject.valueType)
                    : this.navToGoTo;

                if (valueToSet && dynamicValueObject.idToSet) {
                    await setstateIobroker({
                        adapter: this.adapter,
                        id: dynamicValueObject.idToSet,
                        value: valueToSet,
                        ack: dynamicValueObject.ack,
                    });
                    if (dynamicValueObject.confirm && this.onlyConfirmIfWatchIdIsNotSet(dynamicValueObject)) {
                        await exchangeValueAndSendToTelegram(
                            this.adapter,
                            dynamicValueObject.returnText,
                            valueToSet,
                            this.instance,
                            this.userToSend,
                            this.telegramParams,
                            dynamicValueObject.parse_mode,
                        );
                    }
                } else {
                    await sendToTelegram({
                        instance: this.instance,
                        userToSend: this.userToSend,
                        textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValueObject.valueType}`,
                        telegramParams: this.telegramParams,
                    });
                }

                dynamicValue.removeUser(this.userToSend);
                const result = await switchBack(this.adapter, this.userToSend, this.menuData, this.menus, true);

                if (result && !dynamicValueObject.watchForId) {
                    const { textToSend, keyboard, parse_mode } = result;
                    await sendToTelegram({
                        instance: this.instance,
                        userToSend: this.userToSend,
                        textToSend,
                        keyboard,
                        telegramParams: this.telegramParams,
                        parse_mode,
                    });
                    return true;
                }

                await sendNav(this.adapter, this.instance, part, this.userToSend, this.telegramParams);
                return true;
            }

            const call = this.navToGoTo.includes('menu:') ? this.navToGoTo.split(':')[2] : this.navToGoTo;
            part = groupData?.[call];

            if (!this.navToGoTo.includes('menu:') && this.isUserActiveCheckbox[groupWithUser]) {
                const nav = part?.nav;
                if (nav) {
                    this.adapter.log.debug(`Menu to Send: ${jsonString(nav)}`);
                    backMenuFunc({ activePage: call, navigation: nav, userToSend: this.userToSend });

                    if (jsonString(nav).includes('menu:')) {
                        this.adapter.log.debug(`Submenu: ${jsonString(nav)}`);
                        const result = await callSubMenu({
                            adapter: this.adapter,
                            instance: this.instance,
                            jsonStringNav: jsonString(nav),
                            userToSend: this.userToSend,
                            telegramParams: this.telegramParams,
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

                    await sendNav(this.adapter, this.instance, part, this.userToSend, this.telegramParams);
                    return true;
                }

                if (part?.switch) {
                    await handleSetState(this.adapter, this.instance, part, this.userToSend, null, this.telegramParams);
                    return true;
                }

                if (part?.getData) {
                    await getState(this.instance, part, this.userToSend, this.telegramParams);
                    return true;
                }

                if (part?.sendPic) {
                    this.timeouts = sendPic(
                        this.instance,
                        part,
                        this.userToSend,
                        this.telegramParams,
                        this.token,
                        this.directoryPicture,
                        this.timeouts,
                        this.timeoutKey,
                    );
                    return true;
                }

                if (part?.location) {
                    this.adapter.log.debug('Send location');
                    await sendLocationToTelegram(this.instance, this.userToSend, part.location, this.telegramParams);
                    return true;
                }

                if (part?.echarts) {
                    this.adapter.log.debug('Send echarts');
                    getChart(this.instance, part.echarts, this.directoryPicture, this.userToSend, this.telegramParams);
                    return true;
                }

                if (part?.httpRequest) {
                    this.adapter.log.debug('Send http request');
                    return await httpRequest(
                        this.adapter,
                        this.instance,
                        part,
                        this.userToSend,
                        this.telegramParams,
                        this.directoryPicture,
                    );
                }
            }

            if (isSubmenuOrMenu(this.navToGoTo) && this.menuData[groupWithUser]?.[call]) {
                this.adapter.log.debug('Call Submenu');
                await callSubMenu({
                    adapter: this.adapter,
                    instance: this.instance,
                    jsonStringNav: this.navToGoTo,
                    userToSend: this.userToSend,
                    telegramParams: this.telegramParams,
                    part,
                    allMenusWithData: this.menuData,
                    menus: this.menus,
                });
                return true;
            }

            return false;
        } catch (e: any) {
            errorLogger('Error processData:', e, this.adapter);
        }
    }

    private onlyConfirmIfWatchIdIsNotSet(dynamicValueObject: IDynamicValue): boolean {
        return !dynamicValueObject.watchForId;
    }
}
