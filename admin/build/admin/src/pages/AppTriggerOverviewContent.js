"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const react_1 = __importStar(require("react"));
const select_js_1 = __importDefault(require("../components/btn-Input/select.js"));
const Utils_1 = require("@/lib/Utils");
const actionUtils_1 = require("@/lib/actionUtils");
const color_1 = require("@/lib/color");
const AppTriggerOverviewContentSquare_js_1 = __importDefault(require("./AppTriggerOverviewContentSquare.js"));
class TriggerOverview extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            ulPadding: {},
            trigger: null,
            selected: '',
            options: [],
        };
    }
    dataOfIterate = { menu: '' };
    ulPadding = {};
    colorArray = [];
    menuArray = [];
    getMenusWithUserOrIndexOfMenu(menuCall) {
        const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
        const menusWithUser = [];
        const userInMenu = this.props.usersInGroup[menuCall];
        arrayUsersInGroup.forEach((menu, index) => {
            userInMenu.forEach(user => {
                if (this.props.usersInGroup[menu].includes(user)) {
                    menusWithUser.push({ menu: menu, index: index });
                }
            });
        });
        return { menusWithUser: menusWithUser, arrayUsersInGroup: arrayUsersInGroup };
    }
    getIndexOfMenu(menuCall) {
        const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
        let colorIndex = 0;
        const userInMenu = this.props.usersInGroup[menuCall];
        arrayUsersInGroup.forEach((menu, index) => {
            userInMenu.forEach(user => {
                if (this.props.usersInGroup[menu].includes(user) && menu == menuCall) {
                    colorIndex = index;
                }
            });
        });
        return colorIndex;
    }
    getColorUsedTriggerNav({ menuCall, trigger, }) {
        this.menuArray = [];
        const result = this.getMenusWithUserOrIndexOfMenu(menuCall);
        const menusWithUser = (0, Utils_1.deleteDoubleEntriesInArray)(result.menusWithUser);
        this.colorArray = [];
        for (const menu of menusWithUser) {
            if (!this.ulPadding[menuCall]) {
                this.ulPadding[menuCall] = 0;
            }
            if (this.state.trigger?.everyTrigger[menu.menu] &&
                this.state.trigger?.everyTrigger[menu.menu].includes(trigger)) {
                for (let key = 0; key < result.arrayUsersInGroup.length; key++) {
                    if (result.arrayUsersInGroup[key] === menu.menu) {
                        if (!this.menuArray.includes(menu.menu)) {
                            this.menuArray.push(menu.menu);
                        }
                        this.colorArray.push({ color: color_1.colors[menu.index], menu: menu.menu, index: key });
                        if (this.ulPadding[menuCall] < (this.colorArray.length - 4) * 11 + 15) {
                            this.ulPadding[menuCall] = (this.colorArray.length - 4) * 11 + 15;
                        }
                    }
                }
            }
        }
        if (this.colorArray.length !== 0) {
            return this.colorArray;
        }
        if (trigger == '-' && this.ulPadding[menuCall] != 37) {
            this.ulPadding[menuCall] = 10;
        }
        else if (this.ulPadding[menuCall] < 37) {
            this.ulPadding[menuCall] = 37;
        }
        return [{ color: 'white', menu: 'Is not assigned ', index: null, used: adapter_react_v5_1.I18n.t('not created') }];
    }
    getColorNavElemente(index, menu, trigger) {
        const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
        const result = this.getMenusWithUserOrIndexOfMenu(menu);
        const menusWithUser = result.menusWithUser;
        let menu2 = '';
        for (const menuObj of menusWithUser) {
            menu2 = menuObj.menu;
            if (this.state.trigger?.usedTrigger.nav[menu2] &&
                this.state.trigger?.usedTrigger.nav[menu2].includes(trigger)) {
                for (let key = 0; key < arrayUsersInGroup.length; key++) {
                    if (arrayUsersInGroup[key] === menu2) {
                        this.dataOfIterate.menu = menu2;
                        return color_1.colors[key];
                    }
                }
            }
            else {
                for (const action in this.state.trigger?.usedTrigger.action[menu2]) {
                    if (this.state.trigger.usedTrigger.action[menu2][action].includes(trigger)) {
                        for (let key = 0; key < arrayUsersInGroup.length; key++) {
                            if (arrayUsersInGroup[key] === menu2) {
                                this.dataOfIterate.menu = menu2;
                                return color_1.colors[key];
                            }
                        }
                    }
                }
            }
        }
        if (!this.ulPadding[menu]) {
            this.ulPadding[menu] = 0;
        }
        if (this.ulPadding[menu] < 37) {
            this.ulPadding[menu] = 37;
        }
        return 'black';
    }
    getMenu() {
        return this.dataOfIterate.menu;
    }
    createdData(menu) {
        const result = (0, actionUtils_1.updateTriggerForSelect)(this.props.data, this.props.usersInGroup, menu);
        this.setState({ trigger: (0, Utils_1.deepCopy)(result?.triggerObj) });
    }
    getOptions() {
        const options = [];
        for (const menu in this.props.data.nav) {
            if (this.props.data.nav[menu][0].call != '-') {
                options.push(menu);
            }
        }
        this.setState({ options: options, selected: options[0] });
        this.createdData(options[0]);
    }
    componentDidMount() {
        this.getOptions();
        this.setState({ ulPadding: this.ulPadding });
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.trigger != this.state.trigger) {
            this.setState({ ulPadding: this.ulPadding });
        }
    }
    updateHandler = ({ val }) => {
        this.setState({ selected: val });
        this.createdData(val);
    };
    render() {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(select_js_1.default, { options: this.state.options, label: adapter_react_v5_1.I18n.t('startMenus'), name: "instance", selected: this.state.selected, id: "startMenu", callback: this.updateHandler }),
            this.state.trigger ? (react_1.default.createElement("div", { className: "trigger__overview_wrapper" },
                react_1.default.createElement("div", { className: "menu__card_container" },
                    react_1.default.createElement("p", null, adapter_react_v5_1.I18n.t('unusedTrigger')),
                    react_1.default.createElement("ul", null, this.state.trigger.unUsedTrigger.map((trigger, index) => {
                        return (react_1.default.createElement("div", { key: index, style: { position: 'relative' } },
                            react_1.default.createElement(AppTriggerOverviewContentSquare_js_1.default, { color: "black", position: 0, noText: true }),
                            react_1.default.createElement("li", null, trigger)));
                    }))),
                Object.keys(this.state.trigger.usedTrigger.action).map((menu, indexUsedTrigger) => {
                    return (react_1.default.createElement("div", { key: indexUsedTrigger, className: "menu__card_container" },
                        react_1.default.createElement("div", { className: this.state.trigger?.usedTrigger.nav[menu][0] == '-'
                                ? 'menu-disabled'
                                : 'trigger__overview_menu-startside' },
                            react_1.default.createElement("div", { style: { display: 'flex', flexWrap: 'wrap' } },
                                react_1.default.createElement("p", { className: "noMargin inlineBlock strong" }, this.state.trigger?.usedTrigger.nav[menu][0] == '-'
                                    ? 'submenu'
                                    : 'startSide'),
                                this.props.userActiveCheckbox[menu] ? (react_1.default.createElement("span", { className: "textRight active" },
                                    " ",
                                    adapter_react_v5_1.I18n.t('Active'))) : (react_1.default.createElement("span", { className: "textRight inactive" },
                                    " ",
                                    adapter_react_v5_1.I18n.t('Inactive')))),
                            react_1.default.createElement("p", { className: "noMargin" },
                                adapter_react_v5_1.I18n.t('setMenu'),
                                ": ",
                                menu)),
                        react_1.default.createElement("div", { className: "trigger__overview_user-list", style: { border: `4px solid ${color_1.colors[this.getIndexOfMenu(menu)]}` } },
                            react_1.default.createElement("p", { className: "trigger__overview_user" }, adapter_react_v5_1.I18n.t('userList')),
                            this.props.usersInGroup[menu].map((user, indexUser) => {
                                return react_1.default.createElement("p", { key: indexUser }, user);
                            })),
                        react_1.default.createElement("ul", { key: indexUsedTrigger, className: "menu__action_list", style: { paddingLeft: this.state.ulPadding[menu] } },
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("p", { className: "strong" }, adapter_react_v5_1.I18n.t('navigationButtons')),
                                react_1.default.createElement("ul", { className: "list__created-trigger" }, this.state.trigger?.everyTrigger[menu].map((trigger, indexTrigger) => {
                                    return (react_1.default.createElement("div", { key: indexTrigger, style: { position: 'relative' } },
                                        react_1.default.createElement(AppTriggerOverviewContentSquare_js_1.default, { position: 0, color: this.getColorNavElemente(indexUsedTrigger, menu, trigger) || '' }),
                                        react_1.default.createElement("li", { key: indexTrigger, title: `${adapter_react_v5_1.I18n.t('linkedWith')} ${this.getMenu()}` }, trigger)));
                                }))),
                            react_1.default.createElement("li", { className: "strong" }, adapter_react_v5_1.I18n.t('usedTrigger')),
                            react_1.default.createElement("li", null,
                                react_1.default.createElement("p", { className: "trigger__overview_menu-description" }, "nav"),
                                react_1.default.createElement("ul", null, this.state.trigger?.usedTrigger.nav[menu].map((trigger, indexTrigger) => {
                                    return (react_1.default.createElement("div", { key: indexTrigger, style: { position: 'relative' } },
                                        this.getColorUsedTriggerNav({
                                            index: indexUsedTrigger,
                                            menuCall: menu,
                                            trigger,
                                        })?.map((item, i) => (react_1.default.createElement(AppTriggerOverviewContentSquare_js_1.default, { key: i, position: i, color: item.color, trigger: trigger }))),
                                        react_1.default.createElement("li", { className: indexTrigger == 0 && trigger == '-'
                                                ? 'menu-disabled'
                                                : indexTrigger == 0
                                                    ? 'trigger__overview_menu-startside'
                                                    : '', title: `${adapter_react_v5_1.I18n.t('linkedWith')} ${this.menuArray.join(', ')}` }, trigger)));
                                }))),
                            this.state.trigger?.usedTrigger.action[menu]
                                ? Object.keys(this.state.trigger?.usedTrigger.action[menu]).map((action, index2) => {
                                    return (react_1.default.createElement("li", { key: index2 },
                                        react_1.default.createElement("p", { className: "trigger__overview_menu-description" }, action),
                                        react_1.default.createElement("ul", null, (this.state.trigger?.usedTrigger.action[menu][action]).map((trigger, index3) => {
                                            return (react_1.default.createElement("div", { key: index3, style: { position: 'relative' } },
                                                this.getColorUsedTriggerNav({
                                                    index: indexUsedTrigger,
                                                    menuCall: menu,
                                                    trigger,
                                                })?.map((item, i) => (react_1.default.createElement(AppTriggerOverviewContentSquare_js_1.default, { key: i, position: i, color: item.color }))),
                                                react_1.default.createElement("li", { key: index3, title: `${adapter_react_v5_1.I18n.t('linkedWith')} ${this.menuArray.join(', ')}` }, trigger)));
                                        }))));
                                })
                                : null)));
                }))) : null));
    }
}
exports.default = TriggerOverview;
//# sourceMappingURL=AppTriggerOverviewContent.js.map