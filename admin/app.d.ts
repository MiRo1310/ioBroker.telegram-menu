
interface AdditionalPropInfo {
    themeName: string
}
interface AdditionalStateInfo {
    showDropBox: boolean
    native: Native
    connectionReady: boolean
    activeMenu: string
    usedTrigger: string[]
    dropDifferenzX: number
    dropDifferenzY: number
    instances: string[]
    doubleTrigger: string[]
    unUsedTrigger: string[]
    triggerObject: TriggerObject
    tab: string
    popupMenuOpen: boolean
    subTab: string
    draggingRowIndex: number | null
    showTriggerInfo: boolean
    data: {}
    showPopupMenuList: boolean
    dropBoxTop: number
    dropBoxRight: number
    themeName: string
    themeType: string
}

interface PropsSettings {
    data: {
        state: {
            native: {
                instance: string
                textNoEntry: string
                tokenGrafana: string
                directory: string
                checkbox: {
                    [key: string]: boolean;
                };
            };
        };

        instances: string[];
        checkbox: Object
    };
    callback: Callback
}

interface callback {
    setState?: React.Component['setState'], updateNative?: UpdateNativeFunction
}
interface StateTabNavigation {
    rowPopup: boolean;
    rowIndex: number;
    editRow: boolean;
    valuesAreOk: boolean;
    callInUse: boolean;
    helperTextFor: string;
    editedValueFromHelperText: string | null;
    isOK: boolean;
    helperText: boolean;
    newRow: Record<string, any>; // Ersetzen Sie 'any' durch den tatsächlichen Typ
    call: string
    nav: string
    text: string
}
interface PropsTabNavigation {
    data: Data
    entries: NavEntries[]
    activeMenu: string;
    callback: Callback;
}
interface NavEntries {
    name: string;
    width: string;
    checkbox?: boolean;
    title?: string;
    editWidth?: string;
    headline: string;
    val: string;
}
type UpdateNative = {
    updateNative: UpdateNativeFunction
}
interface SetState {
    setState: (obj: { [key: string]: any }) => void;

}

interface TableData {
}
interface PropsTableDndNav {
    entries: NavEntries[]
    tableData: TableData | undefined
    card: string,
    activeMenu?: string
    openAddRowCard: (value: any) => void
    showButtons: { add: boolean, remove: boolean, edit: boolean }
    data: Data
    setState: Function
    callback: CallbackFunctions

}

interface StateTableDndNav {
    rows: Rows[]
    dropStart: number
    dropOver: number
    dropEnd: number
    mouseOverNoneDraggable: boolean

}

interface PropsTabAction {
    callback: Callback
    activeMenu: string
    data: Data
}

interface Data {
    activeMenu?: string
    nav?: TableData
    state: AdditionalStateInfo
    data?: any
    action?: any
    socket?: any
    themeName?: string
    themeType?: string
    adapterName?: string
    unUsedTrigger?: string[]
    usersInGroup?: string[]
    userActiveCheckbox?: IsUserActiveCheckbox
}
interface StateTabAction {
    value: string
}
interface ButtonSmallProps {
    index?: number;
    callbackValue?: CallbackValue
    callback: any;
    disabled?: string;
    class?: string;
}
interface ButtonProps {
    color?: string;
    b_color?: string;
    padding?: string
    small?: BooleanString
    fontSize?: string
    border?: string
    width?: string
    margin?: string
    height?: string
    round?: string
    maxWidth?: string
    verticalAlign?: string
    secondCallback?: Function
    index?: number | null
    callback: Function
    callbackValue?: CallbackValue
    id?: string
    setNative?: boolean
    title?: string
    name?: string
    disabled?: string | boolean
    className?: string
    children?: ReactNode
}
type CallbackValue = boolean | string | number | undefined

interface PropsCheckbox {
    id: string;
    label?: string;
    isChecked: boolean;
    callback: any;
    callbackValue?: string;
    setNative?: boolean;
    obj?: boolean;
    index?: number;
    title?: string;
    width?: string;
    marginLeft?: string;
    marginTop?: string;
    class?: string;
}
type BooleanString = "true" | "false"

interface PropsRowNavCard {
    entries: NavEntries[];
    newRow: any;
    callback: any;
    inUse: boolean;
    openHelperText: (value: string) => void;
}
interface Entries {
    name: string;
    checkbox: boolean;
    editWidth: string;
    headline: string;
    width: number;
    val: string;
    title: string;
}
interface SelectProps {
    id: string;
    name?: string;
    label?: string;
    placeholder?: string;
    options: string[];
    selected: string;
    callback: React.Component['setState']
    setNative?: boolean;
    width?: string;
    callbackValue?: CallbackValue
}
type UpdateNativeFunction = (key: string, value?: any, cb?: () => void) => void
interface InputProps {
    id: string;
    type?: string;
    placeholder?: string;
    value: string;
    callback: React.Component['setState']
    label?: string;
    setNative?: boolean;
    spellCheck?: boolean;
    width?: string | number;
    inputWidth?: string;
    margin?: string;
    class?: string;
    children?: ReactNode;
    function?: string;
    index?: number;
    onMouseOver?: (e: any, setState: any) => void;
    onMouseLeave?: (e: any, setState: any) => void;
    setState?: any;
    callbackValue?: CallbackValue;
    className?: string;
}
interface PropsHeaderIconBar {
    instance: number;
    common: Record<string, any>;
    native: any;
    onLoad: (error: Record<string, null>) => void;
    onError: (text: any) => void;
    adapterName: string;
    changed: boolean;
    onChange: UpdateNativeFunction
}
interface PropsHelperCard {
    helper: {};
    val: string;
    editedValueFromHelperText: string;
    setState: React.Component['setState']
    data: any;
    callback: any;
    name: string;
    text: string;
    helperTextForInput: string;
}
interface StateHelperCard {
    rows: any;
    showSelectId: boolean;
    selectedId: string;
}
type SetStateFunction = (obj: { [key: string]: any }) => void
interface PropsTextarea {
    id: string;
    value: string;
    callback: any;
    placeholder?: string;
    class?: string;
    width?: string;
    inputWidth?: string;
    margin?: string;
    label: string;
    children?: ReactNode;
    function?: string;
    setNative?: boolean;
    spellCheck?: boolean;
    onMouseOver?: (e: any, setState: any) => void;
    onMouseLeave?: (e: any, setState: any) => void;
    setState?: any;
    rows?: number;
    cols?: number;
    index?: number;
    callbackValue?: CallbackValue;
}
interface StateTextarea {
    value: string;

}
interface PropsActionCard {
    data: any;
    activeMenu: string;
    card: string;
    subCard: string;
    entries: any;
    popupCard: any;
    titlePopup: string;
    showButtons: any;
    callback: any;
    searchRoot: any;
}
interface StateActionCard {
    rowPopup: boolean;
    rowIndex: number;
    editRow: boolean;
    newRow: any;
    rowsLength: number;
    newUnUsedTrigger: any;
    helperText: boolean;
    helperTextFor: string;
    editedValueFromHelperText: any;
    isOK: boolean;
    valueForSave: any;
    inputValuesAreOK: boolean;
    disableInput: boolean;
    nav: string;
    text: string;
    helperTextForInput: string;
}
interface PropsTableDndAction {
    tableData: any;
    activeMenu: string;
    subCard: string;
    entries: any;
    data: any;
    setState: any;
    showButtons: boolean;
    openAddRowCard: any;
    callback: any;
    addEditedTrigger: any;
    card: string
}
interface StateTableDndAction {
    dropStart: number;
    dropEnd: number;
    dropOver: number;
    rows: any;
    mouseOverNoneDraggable: boolean;
}
interface PropsSubTable {
    data: [];
    name: string;
    entry: any;
    setState: any;
}
interface PropsTelegramUserCard {
    name: string;
    chatID: string;
    data: any;
    callback: any;
    setState: any;
    class?: string;
    key?: number;
}
interface StateTelegramUserCard {
    usersInGroup: any;
    name: string;
    activeMenu: string;
}
interface PropsPopupContainer {
    title: string;
    isOK?: boolean;
    closeBtn?: boolean;
    width?: string;
    call?: string
    nav?: string
    text?: string
    usedTrigger?: string[]
    height?: string;
    class?: string;
    drag?: string;
    top?: string;
    reference?: any;
    onDragStart?: any;
    onDragEnd?: any;
    onDragOver?: any;
    onDrop?: any;
    onDrag?: any;
    onMouseEnter?: any;
    onMouseLeave?: any;
    callback: any;
    value?: string;
    setState?: Function
    data?: { [key: string]: any };
    children?: ReactNode
}
interface StatePopupContainer {
    menuName: string;
    disable: boolean;
    inUse: boolean;
}
interface PropsRowEditPopupCard {
    entrys: any;
    newRow: any;
    data: any;
    openHelperText: any;
    subCard: any;
    searchRoot: any;
    buttons: any;
    newUnUsedTrigger: any;
    callback?: { setState: React.Component['setState'] };

}
interface StateRowEditPopupCard {
    rows: Rows[];
    trigger: string;
    data: any;
    showSelectId: boolean;
    selectIdValue: string;
    indexID: number;
    dropStart: number;
    dropEnd: number;
    dropOver: number;
    mouseOverNoneDraggable: boolean;
    itemForID: string;
}
interface Rows {
    IDs: string;
    call?: string
}

interface AppState {
    selectedTab: any;
    selectedTabNum: number;
    native: {};
    errorText: string;
    changed: boolean;
    connected: boolean;
    loaded: boolean;
    isConfigurationError: string;
    expertMode: boolean;
    toast: string;
    theme: import("./types").Theme;
    themeName: string;
    themeType: string;
    bottomButtons: boolean;
    width: import("./types").Width;
    confirmClose: boolean;
    _alert: boolean;
    _alertType: string;
    _alertMessage: string;
    showDropBox: boolean;


}

interface TriggerObject {
    unUsedTrigger: string[];
    everyTrigger: {};
    usedTrigger: {
        nav: {};
        action: {};
    };
}

interface PropsDropBox {
    native: Native
    callback: any;
    tab: string;
    subTab: string;
    index: number | null;
    activeMenu: string;
}
interface StateDropBox {
    inDropBox: boolean;
    menuList: string[];
    selectedMenu: string;
    selectedValue: string;
    openRenamePopup: boolean;
    trigger: string;
    newTrigger: string;
    usedTrigger: string[];
    rowToWorkWith: any;
    isOK: boolean;
    oldTrigger: string;
}
interface PropsRenameCard {
    data: any;
    id?: string;
    callback: any;
    value?: string;
}

interface StateRenameCard {
}
interface PropsTriggerOverview {
    data: any;
    usersInGroup: any;
    userActiveCheckbox: any;
}
interface StateTriggerOverview {
    ulPadding: any;
    trigger: any;
    groupsOfMenus: any;
    selected: string;
    options: any;
}
interface MenuWithUser {
    menu: string
    index: number
}

interface PropsSquare {
    color: string;
    trigger?: string;
    position: number;
    noText?: boolean;
}
interface StateSquare {
    bColor: string;
    width: number;
    color: string;
    text: string;
    left: string;
    fontWeight: string;
}
interface PropsHeaderTelegramUsers {
    callback: any;
    data: any;
    menuPopupOpen: boolean;
}
interface StateHeaderTelegramUsers {
    menuOpen: boolean;
    errorUserChecked: boolean;
    menuChecked: boolean;
}
interface PropsHeaderMenu {
    data: any;
    callback: any;
}
interface PropsBtnCard {
    callback: any;
    data: any;
}
interface StateBtnCard {
    oldMenuName: string;
    newMenuName: string;
    renamedMenuName: string;
    confirmDialog: boolean;
    renameDialog: boolean;
    menuNameExists: boolean;
    isOK: boolean;
}
interface PropsMenuPopupCard {
    usersInGroup: any;
    callback: any;
}
interface PropsMenuButton {
    b_color?: string;
    color?: string;
    title?: string;
    onChangeValue?: () => void;
    children?: ReactNode;
}

interface Native {
    dropbox: {
        dropboxTop: number
        dropboxRight: number
    }
    data: DataObject
    usersInGroup: string[]
    nav: any;
    instance: string;
    data: NativeData;
    checkbox: {
        sendMenuAfterRestart: boolean
        checkboxNoValueFound: boolean
        resKey: boolean
        oneTiKey: boolean
    };
    usersForGlobal: string;
    users: never[];
    startsides: never[];
    tokenGrafana: string;
    directory: string;
    userActiveCheckbox: {};
    usersInGroup: {};
    textNoEntry: string;
    userListWithChatID: never[];
}
interface NativeData {
    action: { [key: string]: Actions }
    nav: { [key: string]: Nav }

}
interface Actions {
    get: Get[],
    set: Set[],
    pic: Pic[],
    httpRequest: HttpRequest[],
    echarts: Echart[],
    events: Events[]
}
interface HttpRequest {
    url: string[],
    user: string[],
    password: string[],
    filename: string[],
    trigger: string[],
    delay: string[],
}
interface Nav {
    nav: string
    call: string
    value: string
    text: string
    parse_mode: BooleanString
}
interface Set {
    ack: BooleanString[],
    confirm: BooleanString[],
    parse_mode: BooleanString[],
    switch_checkbox: BooleanString[],
    IDs: string[],
    returnText: string[],
    trigger: string[],
    values: string[],
}
interface Get {
    newline_checkbox: BooleanString[],
    parse_mode: BooleanString[],
    IDs: string[],
    text: string[],
    trigger: string[],
}
interface Events {
    ack: BooleanString[],
    ID: string[],
    menu: string[],
    condition: string,
}
interface Pic {
    IDs: string[],
    filename: string[],
    trigger: string[],
    picSendDelay: string[],
}
interface Echart {
    background: string[],
    echartsInstance: string[],
    filename: string[],
    preset: string,
    theme: string[],
    trigger: string[],
}
interface PropsMainTabList {
    callback: CallbackFunctions;
}
interface PropsMainActions {
    data: any
    tab: string
    callback: CallbackFunctions;
}
interface CallbackFunctions {
    setState: Function
    updateNative: UpdateNativeFunction
}
interface PropsMainTriggerOverview {
    state: AdditionalStateInfo;
    callback: CallbackFunctions;
}
interface PropsMainDoubleTriggerInfo {
    state: AdditionalStateInfo;
}
interface PropsMainContent {
    state: AdditionalStateInfo;
    socket: any;
    data: any;
    callback: CallbackFunctions;
    adapterName: string;
}
interface PropsMainDropBox {
    state: AdditionalStateInfo;
    callback: CallbackFunctions;
    dropBoxRef: any;
}
interface PropsTableNavHeader {
    entries: NavEntries[];
}