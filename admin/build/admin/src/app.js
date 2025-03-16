"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionUtils_1 = require("@/lib/actionUtils");
const movePosition_1 = require("@/lib/movePosition");
const newValuesForNewVersion_1 = require("@/lib/newValuesForNewVersion");
const socket_1 = __importDefault(require("@/lib/socket"));
const AppContent_1 = __importDefault(require("@/pages/AppContent"));
const AppDoubleTriggerInfo_1 = __importDefault(require("@/pages/AppDoubleTriggerInfo"));
const AppDropBox_1 = __importDefault(require("@/pages/AppDropBox"));
const AppHeaderIconBar_1 = __importDefault(require("@/pages/AppHeaderIconBar"));
const AppTriggerOverview_1 = __importDefault(require("@/pages/AppTriggerOverview"));
const ErrorBoundary_1 = __importDefault(require("@components/ErrorBoundary"));
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const material_1 = require("@mui/material");
const react_1 = __importDefault(require("react"));
const dragNDrop_1 = require("./lib/dragNDrop");
const object_1 = require("./lib/object");
const Utils_1 = require("./lib/Utils");
const translations_json_1 = __importDefault(require("../i18n/en/translations.json"));
const translations_json_2 = __importDefault(require("../i18n/de/translations.json"));
const translations_json_3 = __importDefault(require("../i18n/ru/translations.json"));
const translations_json_4 = __importDefault(require("../i18n/pt/translations.json"));
const translations_json_5 = __importDefault(require("../i18n/nl/translations.json"));
const translations_json_6 = __importDefault(require("../i18n/fr/translations.json"));
const translations_json_7 = __importDefault(require("../i18n/it/translations.json"));
const translations_json_8 = __importDefault(require("../i18n/es/translations.json"));
const translations_json_9 = __importDefault(require("../i18n/pl/translations.json"));
const translations_json_10 = __importDefault(require("../i18n/uk/translations.json"));
const translations_json_11 = __importDefault(require("../i18n/zh-cn/translations.json"));
class App extends adapter_react_v5_1.GenericApp {
    dropBoxRef;
    constructor(props) {
        const extendedProps = {
            ...props,
            encryptedFields: [],
            Connection: adapter_react_v5_1.AdminConnection,
            translations: {
                en: translations_json_1.default,
                de: translations_json_2.default,
                ru: translations_json_3.default,
                pt: translations_json_4.default,
                nl: translations_json_5.default,
                fr: translations_json_6.default,
                it: translations_json_7.default,
                es: translations_json_8.default,
                pl: translations_json_9.default,
                uk: translations_json_10.default,
                'zh-cn': translations_json_11.default,
            },
        };
        super(props, extendedProps);
        this.dropBoxRef = react_1.default.createRef();
        this.state = {
            ...this.state,
            native: {},
            tab: 'nav',
            subTab: 'set',
            draggingRowIndex: null,
            activeMenu: '',
            showPopupMenuList: false,
            instances: [],
            popupMenuOpen: false,
            themeName: 'light',
            themeType: 'light',
            unUsedTrigger: [],
            usedTrigger: [],
            triggerObject: {},
            showTriggerInfo: false,
            showDropBox: false,
            doubleTrigger: [],
            connectionReady: false,
            dropBoxTop: 105,
            dropBoxRight: 5,
            dropDifferenzX: 0,
            dropDifferenzY: 0,
            copyDataObject: { targetCheckboxes: {}, targetActionName: '' },
            clickedTriggerInNav: null,
        };
        this.setState = this.setState.bind(this);
    }
    handleResize = () => {
        (0, movePosition_1.updatePositionDropBox)(null, null, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
    };
    componentDidMount() {
        (0, movePosition_1.updatePositionDropBox)(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
        window.addEventListener('resize', this.handleResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
    newX = null;
    newY = null;
    async componentDidUpdate(prevProps, prevState) {
        if (prevState.native.instance !== this.state.native.instance && this.state.connectionReady) {
            await this.getUsersFromTelegram();
        }
        if (prevState.native.data !== this.state.native.data || prevState.activeMenu !== this.state.activeMenu) {
            if (this.state.activeMenu && this.state.activeMenu != '') {
                (0, actionUtils_1.updateActiveMenuAndTrigger)(this.state.activeMenu, this.setState, this.state.native.data, this.state.native.usersInGroup);
            }
        }
        if (prevState.native.usersInGroup !== this.state.native.usersInGroup) {
            this.updateNativeValue('usersInGroup', (0, actionUtils_1.sortObjectByKey)(this.state.native.usersInGroup));
        }
        if (prevState.usedTrigger !== this.state.usedTrigger) {
            this.setState({ doubleTrigger: (0, object_1.getDoubleEntries)(this.state.usedTrigger) });
        }
        if (prevState.native.dropbox !== this.state.native.dropbox ||
            this.state.showDropBox !== prevState.showDropBox) {
            (0, movePosition_1.updatePositionDropBox)(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
        }
        if (prevState.dropDifferenzX !== this.state.dropDifferenzX ||
            prevState.dropDifferenzY !== this.state.dropDifferenzY) {
            const { newX, newY } = (0, dragNDrop_1.getDefaultDropBoxCoordinates)(this.state.native.dropbox, this.state.dropDifferenzX, this.state.dropDifferenzY);
            this.newX = newX;
            this.newY = newY;
            const dropbox = { dropboxRight: newX, dropboxTop: newY };
            this.updateNativeValue('dropbox', dropbox);
            (0, movePosition_1.updatePositionDropBox)(this.newX, this.newY, this.dropBoxRef, this.state.showDropBox, this.state.native.dropbox);
        }
    }
    async onConnectionReady() {
        (0, newValuesForNewVersion_1.insertNewItemsInData)(this.state.native.data, this.updateNativeValue.bind(this));
        this.updateNativeValue('usersInGroup', (0, actionUtils_1.sortObjectByKey)(this.state.native.usersInGroup));
        await this.getUsersFromTelegram();
        await socket_1.default.getAllTelegramInstances(this.socket, (data) => {
            this.setState({ instances: data });
        });
        const firstMenu = (0, object_1.getFirstItem)(this.state.native.usersInGroup);
        this.setState({ activeMenu: firstMenu });
        (0, actionUtils_1.updateActiveMenuAndTrigger)(firstMenu, this.setState, this.state.native.data, this.state.native.usersInGroup);
        this.setState({ connectionReady: true });
    }
    async getUsersFromTelegram() {
        await socket_1.default.getUsersFromTelegram(this.socket, this.state.native.instance || 'telegram.0', data => {
            !this.state.native.instance
                ? this.updateNativeValue('instance', 'telegram.0')
                : this.updateNativeValue('userListWithChatID', (0, Utils_1.processUserData)(data));
        });
    }
    render() {
        if (!this.state.loaded) {
            return super.render();
        }
        return (react_1.default.createElement("div", { className: `App row relative ${this.props.themeName}` },
            react_1.default.createElement(ErrorBoundary_1.default, null,
                react_1.default.createElement(material_1.Grid, { container: true },
                    react_1.default.createElement(AppHeaderIconBar_1.default, { common: this.common, native: this.state.native, onError: (text) => this.setState({ errorText: text.toString() }), onLoad: native => this.onLoadConfig(native), instance: this.instance, adapterName: this.adapterName, changed: this.state.changed, onChange: (attr, value, cb) => this.updateNativeValue(attr, value, cb) }),
                    react_1.default.createElement(AppContent_1.default, { callback: {
                            setStateApp: this.setState,
                            updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
                        }, data: { state: this.state, adapterName: this.adapterName, socket: this.socket } })),
                this.state.showDropBox ? (react_1.default.createElement(AppDropBox_1.default, { data: { state: this.state, dropBoxRef: this.dropBoxRef }, callback: {
                        setStateApp: this.setState,
                        updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
                    } })) : null,
                this.state.showTriggerInfo ? (react_1.default.createElement(AppTriggerOverview_1.default, { state: this.state, callback: {
                        setState: this.setState,
                        updateNative: (attr, value, cb) => this.updateNativeValue(attr, value, cb),
                    } })) : null,
                this.state.doubleTrigger.length > 0 ? react_1.default.createElement(AppDoubleTriggerInfo_1.default, { state: this.state }) : null,
                this.renderError(),
                this.renderToast(),
                this.renderSaveCloseButtons())));
    }
}
exports.default = App;
//# sourceMappingURL=app.js.map