"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuProcessor = void 0;
const string_1 = require("../lib/string");
const action_1 = require("../app/action");
const setstate_1 = require("../app/setstate");
const telegram_1 = require("../app/telegram");
const backMenu_1 = require("../app/backMenu");
const sendNav_1 = require("../app/sendNav");
const subMenu_1 = require("../app/subMenu");
const getstate_1 = require("../app/getstate");
const sendpic_1 = require("../app/sendpic");
const echarts_1 = require("../app/echarts");
const httpRequest_1 = require("../app/httpRequest");
const validateMenus_1 = require("../app/validateMenus");
const logging_1 = require("../app/logging");
const dynamicValue_1 = require("../app/dynamicValue");
class MenuProcessor {
    menuData;
    navToGoTo;
    menus;
    isUserActiveCheckbox;
    token;
    directoryPicture;
    timeoutKey;
    userToSend;
    telegramParams;
    instance;
    timeouts = [];
    adapter;
    constructor(menuData, navToGoTo, menus, isUserActiveCheckbox, token, directoryPicture, timeoutKey, userToSend, telegramParams, instance) {
        this.menuData = menuData;
        this.navToGoTo = navToGoTo;
        this.menus = menus;
        this.isUserActiveCheckbox = isUserActiveCheckbox;
        this.token = token;
        this.directoryPicture = directoryPicture;
        this.timeoutKey = timeoutKey;
        this.userToSend = userToSend;
        this.telegramParams = telegramParams;
        this.instance = instance;
        this.adapter = this.telegramParams.adapter;
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
        try {
            let part = undefined;
            const dynamicValueObject = dynamicValue_1.dynamicValue.getValue(this.userToSend);
            if (dynamicValueObject) {
                const valueToSet = dynamicValueObject.valueType
                    ? (0, action_1.adjustValueType)(this.adapter, this.navToGoTo, dynamicValueObject.valueType)
                    : this.navToGoTo;
                if (valueToSet && dynamicValueObject.idToSet) {
                    await (0, setstate_1.setstateIobroker)({
                        adapter: this.adapter,
                        id: dynamicValueObject.idToSet,
                        value: valueToSet,
                        ack: dynamicValueObject.ack,
                    });
                    if (dynamicValueObject.confirm && this.onlyConfirmIfWatchIdIsNotSet(dynamicValueObject)) {
                        await (0, setstate_1.exchangeValueAndSendToTelegram)(this.adapter, dynamicValueObject.returnText, valueToSet, this.instance, this.userToSend, this.telegramParams, dynamicValueObject.parse_mode);
                    }
                }
                else {
                    await (0, telegram_1.sendToTelegram)({
                        instance: this.instance,
                        userToSend: this.userToSend,
                        textToSend: `You insert a wrong Type of value, please insert type : ${dynamicValueObject.valueType}`,
                        telegramParams: this.telegramParams,
                    });
                }
                dynamicValue_1.dynamicValue.removeUser(this.userToSend);
                const result = await (0, backMenu_1.switchBack)(this.adapter, this.userToSend, this.menuData, this.menus, true);
                if (result && !dynamicValueObject.watchForId) {
                    const { textToSend, keyboard, parse_mode } = result;
                    await (0, telegram_1.sendToTelegram)({
                        instance: this.instance,
                        userToSend: this.userToSend,
                        textToSend,
                        keyboard,
                        telegramParams: this.telegramParams,
                        parse_mode,
                    });
                    return true;
                }
                await (0, sendNav_1.sendNav)(this.adapter, this.instance, part, this.userToSend, this.telegramParams);
                return true;
            }
            const call = this.navToGoTo.includes('menu:') ? this.navToGoTo.split(':')[2] : this.navToGoTo;
            part = groupData?.[call];
            if (!this.navToGoTo.includes('menu:') && this.isUserActiveCheckbox[groupWithUser]) {
                const nav = part?.nav;
                if (nav) {
                    this.adapter.log.debug(`Menu to Send: ${(0, string_1.jsonString)(nav)}`);
                    (0, backMenu_1.backMenuFunc)({ activePage: call, navigation: nav, userToSend: this.userToSend });
                    if ((0, string_1.jsonString)(nav).includes('menu:')) {
                        this.adapter.log.debug(`Submenu: ${(0, string_1.jsonString)(nav)}`);
                        const result = await (0, subMenu_1.callSubMenu)({
                            adapter: this.adapter,
                            instance: this.instance,
                            jsonStringNav: (0, string_1.jsonString)(nav),
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
                    await (0, sendNav_1.sendNav)(this.adapter, this.instance, part, this.userToSend, this.telegramParams);
                    return true;
                }
                if (part?.switch) {
                    await (0, setstate_1.handleSetState)(this.adapter, this.instance, part, this.userToSend, null, this.telegramParams);
                    return true;
                }
                if (part?.getData) {
                    await (0, getstate_1.getState)(this.instance, part, this.userToSend, this.telegramParams);
                    return true;
                }
                if (part?.sendPic) {
                    this.timeouts = (0, sendpic_1.sendPic)(this.instance, part, this.userToSend, this.telegramParams, this.token, this.directoryPicture, this.timeouts, this.timeoutKey);
                    return true;
                }
                if (part?.location) {
                    this.adapter.log.debug('Send location');
                    await (0, telegram_1.sendLocationToTelegram)(this.instance, this.userToSend, part.location, this.telegramParams);
                    return true;
                }
                if (part?.echarts) {
                    this.adapter.log.debug('Send echarts');
                    (0, echarts_1.getChart)(this.instance, part.echarts, this.directoryPicture, this.userToSend, this.telegramParams);
                    return true;
                }
                if (part?.httpRequest) {
                    this.adapter.log.debug('Send http request');
                    return await (0, httpRequest_1.httpRequest)(this.adapter, this.instance, part, this.userToSend, this.telegramParams, this.directoryPicture);
                }
            }
            if ((0, validateMenus_1.isSubmenuOrMenu)(this.navToGoTo) && this.menuData[groupWithUser]?.[call]) {
                this.adapter.log.debug('Call Submenu');
                await (0, subMenu_1.callSubMenu)({
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
        }
        catch (e) {
            (0, logging_1.errorLogger)('Error processData:', e, this.adapter);
        }
    }
    onlyConfirmIfWatchIdIsNotSet(dynamicValueObject) {
        return !dynamicValueObject.watchForId;
    }
}
exports.MenuProcessor = MenuProcessor;
//# sourceMappingURL=processData.js.map