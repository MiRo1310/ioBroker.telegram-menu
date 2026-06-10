"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuProcessor = void 0;
const string_1 = require("../lib/string");
const action_1 = require("../app/action");
const setstate_1 = require("../app/setstate");
const telegram_1 = require("../app/telegram");
const sendNav_1 = require("../app/sendNav");
const subMenu_1 = require("../app/subMenu");
const getstate_1 = require("../app/getstate");
const sendpic_1 = require("../app/sendpic");
const echarts_1 = require("../app/echarts");
const httpRequest_1 = require("../app/httpRequest");
const validateMenus_1 = require("../app/validateMenus");
const dynamicValue_1 = require("../app/dynamicValue");
class MenuProcessor {
    appContext;
    menuData;
    navToGoTo;
    menus;
    timeoutKey;
    userToSend;
    instance;
    timeouts = [];
    adapter;
    constructor(appContext, menuData, navToGoTo, menus, timeoutKey, userToSend, instance) {
        this.appContext = appContext;
        this.menuData = menuData;
        this.navToGoTo = navToGoTo;
        this.menus = menus;
        this.timeoutKey = timeoutKey;
        this.userToSend = userToSend;
        this.instance = instance;
        this.adapter = this.appContext.adapter;
    }
    async checkEveryMenuForData() {
        for (const menu of this.menus) {
            const groupData = this.menuData[menu];
            this.adapter.log.debug(`Menu : ${menu}`);
            this.adapter.log.debug(`Nav : ${(0, string_1.jsonString)(this.menuData[menu])}`);
            if (await this.processData(menu, groupData)) {
                this.adapter.log.debug('Menu found');
                return true;
            }
        }
        return false;
    }
    getTimeouts() {
        return this.timeouts;
    }
    async processData(groupWithUser, groupData) {
        let part = undefined;
        const dynamicValueObject = dynamicValue_1.dynamicValue.getValue(this.userToSend);
        if (dynamicValueObject) {
            const valueToSet = dynamicValueObject.valueType
                ? (0, action_1.adjustValueType)(this.adapter, this.navToGoTo, dynamicValueObject.valueType)
                : this.navToGoTo;
            if (valueToSet && dynamicValueObject.idToSet) {
                await (0, setstate_1.setstateIobroker)({
                    appContext: this.appContext,
                    id: dynamicValueObject.idToSet,
                    value: valueToSet,
                    ack: dynamicValueObject.ack,
                });
                if (dynamicValueObject.confirm && this.onlyConfirmIfWatchIdIsNotSet(dynamicValueObject)) {
                    await (0, setstate_1.exchangeValueAndSendToTelegram)(this.appContext, dynamicValueObject.returnText, valueToSet, this.instance, this.userToSend, dynamicValueObject.parse_mode);
                }
            }
            else {
                await (0, telegram_1.sendToTelegram)({
                    instance: this.instance,
                    userToSend: this.userToSend,
                    textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValueObject.valueType}`,
                    appContext: this.appContext,
                });
            }
            dynamicValue_1.dynamicValue.removeUser(this.userToSend);
            const result = await this.appContext.backMenuRegistry.switchBack(this.adapter, this.userToSend, this.menuData, this.menus, true);
            if (result && !dynamicValueObject.watchForId) {
                const { textToSend, keyboard, parse_mode } = result;
                await (0, telegram_1.sendToTelegram)({
                    instance: this.instance,
                    userToSend: this.userToSend,
                    textToSend,
                    keyboard,
                    appContext: this.appContext,
                    parse_mode,
                });
                return true;
            }
            await (0, sendNav_1.sendNav)(this.appContext, this.instance, part, this.userToSend);
            return true;
        }
        const call = this.navToGoTo.includes('menu:') ? this.navToGoTo.split(':')[2] : this.navToGoTo;
        part = groupData?.[call];
        if (!this.navToGoTo.includes('menu:') && this.appContext.isUserActiveCheckbox[groupWithUser]) {
            const nav = part?.nav;
            if (nav) {
                this.adapter.log.debug(`Menu to Send: ${(0, string_1.jsonString)(nav)}`);
                this.appContext.backMenuRegistry.backMenuFunc({
                    activePage: call,
                    navigation: nav,
                    userToSend: this.userToSend,
                });
                if ((0, string_1.jsonString)(nav).includes('menu:')) {
                    this.adapter.log.debug(`Submenu: ${(0, string_1.jsonString)(nav)}`);
                    const result = await (0, subMenu_1.callSubMenu)({
                        appContext: this.appContext,
                        instance: this.instance,
                        jsonStringNav: (0, string_1.jsonString)(nav),
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
                await (0, sendNav_1.sendNav)(this.appContext, this.instance, part, this.userToSend);
                return true;
            }
            if (part?.switch) {
                await (0, setstate_1.handleSetState)(this.appContext, this.instance, part, this.userToSend, null);
                return true;
            }
            if (part?.getData) {
                await (0, getstate_1.getState)(this.instance, part, this.userToSend, this.appContext);
                return true;
            }
            if (part?.sendPic) {
                this.timeouts = (0, sendpic_1.sendPic)(this.appContext, this.instance, part, this.userToSend, this.timeouts, this.timeoutKey);
                return true;
            }
            if (part?.location) {
                this.adapter.log.debug('Send location');
                await (0, telegram_1.sendLocationToTelegram)(this.instance, this.userToSend, part.location, this.appContext);
                return true;
            }
            if (part?.echarts) {
                this.adapter.log.debug('Send echarts');
                (0, echarts_1.getChart)(this.instance, part.echarts, this.userToSend, this.appContext);
                return true;
            }
            if (part?.httpRequest) {
                this.adapter.log.debug('Send http request');
                return await (0, httpRequest_1.httpRequest)(this.appContext, this.instance, part, this.userToSend);
            }
        }
        if ((0, validateMenus_1.isSubmenuOrMenu)(this.navToGoTo) && this.menuData[groupWithUser]?.[call]) {
            this.adapter.log.debug('Call Submenu');
            await (0, subMenu_1.callSubMenu)({
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
    onlyConfirmIfWatchIdIsNotSet(dynamicValueObject) {
        return !dynamicValueObject.watchForId;
    }
}
exports.MenuProcessor = MenuProcessor;
//# sourceMappingURL=processData.js.map