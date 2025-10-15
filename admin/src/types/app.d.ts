import type { HelperText } from '@/config/helper';
import type { SaveDataObject } from '@/pages/AppContentTabActionContentRowEditorCopyModalSelectedValues';
import type { EventButton, EventCheckbox, EventTextarea } from '@/types/event';
import type { TelegramMenuApp } from '@/types/props-types';
import type { EventSelect } from '@components/btn-Input/select';
import type { AdminConnection } from '@iobroker/adapter-react-v5';

import type { DragEvent, LegacyRef, ReactNode } from 'react';

export type Nullable<T> = T | null | undefined;

export interface PropsSettings {
    data: DataMainContent;
    callback: CallbackFunctionsApp;
}

export interface StateTabNavigation {
    rowPopup: boolean;
    rowIndex: number;
    editRow: boolean;
    valuesAreOk: boolean;
    callInUse: boolean;
    helperTextFor: string;
    editedValueFromHelperText: string | null;
    isOK: boolean;
    helperText: boolean;
    newRow: RowsNav;
    call: string;
    nav: string;
    text: string;
}

export interface PropsTabNavigation {
    data: DataMainContent & { entries: TabValueEntries[] };
    callback: CallbackFunctionsApp;
}

export interface TabValues {
    label: string;
    value: string;
    trigger: boolean;
    entries: TabValueEntries[];
    popupCard: PopupCard;
    searchRoot?: SearchRoot | null;
}

export interface PopupCard {
    buttons: PopupCardButtons;
    width: string;
    height: string;
}

export interface PopupCardButtons {
    add?: boolean;
    remove?: boolean;
    copy?: boolean;
}

export interface SearchRoot {
    root: string;
    type: ObjectBrowserType | ObjectBrowserType[] | undefined;
}

export type ObjectBrowserType = 'state' | 'instance' | 'channel' | 'device' | 'chart';

export interface TabValueEntries {
    name: string;
    width?: string;
    checkbox?: boolean;
    title?: string;
    editWidth?: string;
    headline: string;
    val: string;
    elementGetRows?: string;
    required?: boolean;
    btnCircleAdd?: boolean;
    search?: boolean;
    noIcon?: boolean;
    password?: boolean;
    type?: string;
}

export interface PropsTableDndNav {
    card: string;
    openAddRowCard: (obj: EventButton) => void;
    showButtons: ShowButtons;
    data: DataMainContent & { entries: TabValueEntries[] };
    setState: SetStateFunction;
    callback: CallbackFunctionsApp;
}

export interface NavData {
    [key: string]: RowsNav[];
}

export interface StateTableDndNav {
    rows: RowForButton[];
    dropStart: number;
    dropOver: number;
    dropEnd: number;
    mouseOverNoneDraggable: boolean;
}

export interface RowsNav {
    call: string;
    parse_mode: BooleanString;
    text: string;
    value: string;
}

export interface PropsTabAction {
    data: DataMainContent;
    callback: CallbackFunctionsApp;
}

export interface AppData {
    activeMenu?: string;
    nav?: NavData;
    state: TelegramMenuApp.AdditionalState;
    data?: NativeData;
    action?: ActionData;
    socket?: Socket;
    themeName?: string;
    themeType?: string;
    adapterName?: string;
    unUsedTrigger?: string[];
    usersInGroup?: MenusWithUsers;
    userActiveCheckbox?: UserActiveCheckbox;
}

export type MenusWithUsers = { [key: string]: UserType[] | undefined };
export type UserType = { name: string; instance: string; chatId: string };

export type socket = AdminConnection;

export interface StateTabAction {
    value: string;
}

export interface ButtonSmallProps {
    index: number;
    callbackValue?: CallbackValue;
    callback: (e: EventButton) => void;
    disabled?: string;
    class?: string;
}

export interface ButtonProps {
    color?: string;
    b_color?: string;
    padding?: string;
    small?: BooleanString;
    fontSize?: string;
    border?: string;
    width?: string;
    margin?: string;
    height?: string;
    round?: string;
    maxWidth?: string;
    verticalAlign?: string;
    index?: number | null;
    callback: (obj) => void;
    callbackValue?: CallbackValue;
    id?: string;
    setNative?: boolean;
    title?: string;
    name?: string;
    disabled?: string | boolean;
    className?: string;
    children?: ReactNode;
    disableButtonStyleByComponent?: boolean;
}

export type CallbackValue = boolean | string | number | undefined;

export interface PropsCheckbox {
    id: string;
    label?: string;
    isChecked: boolean;
    callback: (event: EventCheckbox) => void;
    obj?: boolean;
    index: number;
    title?: string;
    marginLeft?: string;
    marginTop?: string;
    class?: string;
    params?: Record<string, unknown>;
}

export interface PropsRowNavCard {
    entries: TabValueEntries[];
    newRow: RowsNav;
    callback: { onChangeInput: (data: ChangeInputNav) => void; onChangeCheckbox: (data: EventCheckbox) => void };
    inUse: boolean;
    openHelperText: (value: string) => void;
    data: DataMainContent & { entries: TabValueEntries[] };
}

export interface ChangeInputNav {
    id: string;
    val: string;
}

export interface SelectProps {
    id: string;
    name?: string;
    label?: string;
    placeholder?: string;
    options: string[];
    selected: string;
    callback: (obj: EventSelect) => void;
    setNative?: boolean;
    width?: string;
    callbackValue?: CallbackValue;
}

export type UpdateNativeFunction = (key: string, value?: any, cb?: () => void) => void;

export interface InputProps {
    id?: string;
    type?: string;
    placeholder?: string;
    value: string;
    callback: SetStateFunction;
    label?: string;
    spellCheck?: boolean;
    class?: string;
    children?: ReactNode;
    index?: number;
    disabled?: boolean;
    setState?: SetStateFunction;
    onMouseOver?: (e: React.MouseEvent<HTMLInputElement>, setState: SetStateFunction | undefined) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLInputElement>, setState: SetStateFunction | undefined) => void;
    className?: string;
}

export interface PropsHeaderIconBar {
    instance: number;
    common: any;
    native: Native;
    onLoad: (error: Record<string, null>) => void;
    onError: (text: string | number) => void;
    adapterName: string;
    changed: boolean;
    onChange: UpdateNativeFunction;
}

export interface PropsHelperCard {
    helper: object;
    val: string;
    editedValueFromHelperText: string;
    setState: SetStateFunction;
    data: { adapterName?: string; themeType?: string; socket?: socket };
    callback: (val: EventButton) => void;
    name: string;
    text: string;
    helperTextForInput: string;
}

export interface StateHelperCard {
    rows: HelperText['get'] | HelperText['set'] | HelperText['nav'];
    showSelectId: boolean;
    selectedId: string;
}

export type SetStateFunction = React.Component['setState'];

export interface PropsTextarea {
    id: string;
    value: string;
    callback: (val: EventTextarea) => void;
    placeholder?: string;
    class?: string;
    width?: string;
    inputWidth?: string;
    margin?: string;
    label: string;
    children?: ReactNode;
    spellCheck?: boolean;
    onMouseOver?: (
        e: React.MouseEvent<HTMLTextAreaElement> | undefined,
        setState: SetStateFunction | undefined,
    ) => void;
    onMouseLeave?: (
        e: React.MouseEvent<HTMLTextAreaElement> | undefined,
        setState: SetStateFunction | undefined,
    ) => void;
    setState?: SetStateFunction;
    rows?: number;
    cols?: number;
    index?: number;
    callbackValue?: CallbackValue;
}

export interface StateTextarea {
    value: string;
}

export interface PropsActionCard {
    data: DataMainContent & TabActionContentTableProps;
    callback: CallbackFunctionsApp;
}

export interface TabActionContentTableProps {
    tab: TabValues;
    card: string;
    showButtons: ShowButtons;
}

export interface StateActionCard {
    rowPopup: boolean;
    rowIndexToEdit: number;
    editRow: boolean;
    newRow: ActionNewRowProps;
    rowsLength: number;
    newUnUsedTrigger: string[] | null;
    helperText: boolean;
    helperTextFor: string;
    editedValueFromHelperText: string | null;
    isOK: boolean;
    valueForSave: { subCard: string; entry: string; index: number } | null;
    inputValuesAreOK: boolean;
    disableInput: boolean;
    nav: string;
    text: string;
    helperTextForInput: string;
}

export interface PropsTableDndAction {
    data: DataMainContent & TabActionContentTableProps;
    callback: CallbackFunctionsApp & CallbackTabActionContent & TabActionContentCallback;
}

export interface TabActionContentCallback {
    addEditedTrigger: (trigger: string | null) => void;
    openAddRowCard: (val: EventButton) => void;
}

export interface StateTableDndAction {
    dropStart: number;
    dropEnd: number;
    dropOver: number;
    rows: RowForButton[];
    mouseOverNoneDraggable: boolean;
}

export interface PropsSubTable {
    data: [];
    name: string;
    entry: TabValueEntries;
    setState: SetStateFunction;
}

export interface PropsTelegramUserCard {
    user: UserListWithChatID;
    data: {
        state: TelegramMenuApp.AdditionalState;
        activeMenu: string;
        usersInGroup: MenusWithUsers;
        userActiveCheckbox: UserActiveCheckbox;
    };
    callback: CallbackFunctionsApp;
    setState: SetStateFunction;
    class?: string;
    key?: number;
}

export interface StateTelegramUserCard {
    usersInGroup: MenusWithUsers;
    name: string;
    activeMenu: string;
}

export interface PropsPopupContainer {
    title: string;
    isOK?: boolean;
    onlyCloseBtn?: boolean;
    width?: string;
    call?: string;
    nav?: string;
    text?: string;
    usedTrigger?: string[];
    height?: string;
    class?: string;
    drag?: string;
    top?: string;
    left?: string;
    right?: string;
    labelBtnAbort?: string;
    labelBtnOK?: string;
    reference?: LegacyRef<HTMLDivElement> | undefined;
    onDragStart?: (event: DragEvent<HTMLDivElement>, setState?: SetStateFunction) => void;
    onDragEnd?: (event: DragEvent<HTMLDivElement>, setState?: SetStateFunction) => void;
    onDragOver?: (event: DragEvent<HTMLDivElement>, setState?: SetStateFunction) => void;
    onDrop?: (event: DragEvent<HTMLDivElement>, setState: SetStateFunction | undefined) => void;
    onDrag?: (event: DragEvent<HTMLDivElement>, setState: SetStateFunction | undefined) => void;
    onMouseEnter?: (event: MouseEvent<HTMLDivElement>, setState: SetStateFunction | undefined) => void;
    onMouseLeave?: (event: MouseEvent<HTMLDivElement>, setState: SetStateFunction | undefined) => void;
    callback: (val: EventButton) => void;
    value?: string;
    setState?: SetStateFunction;
    children?: ReactNode;
}

export interface StatePopupContainer {
    menuName: string;
    disable: boolean;
    inUse: boolean;
}

export interface PropsRowEditPopupCard {
    data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { rowIndexToEdit: number };
    callback: CallbackFunctionsApp &
        CallbackTabActionContent & {
            openHelperText: (value: { subCard: string; entry: string; index: number }) => void;
        };
}

export interface DataTabActionContent {
    newRow: ActionNewRowProps;
    newUnUsedTrigger: string[];
}

export interface CallbackTabActionContent {
    setStateTabActionContent: SetStateFunction;
}

export type BooleanString = 'true' | 'false';

export interface ActionNewRowProps {
    IDs: string[];
    ack: BooleanString[];
    confirm: BooleanString[];
    parse_mode: BooleanString[];
    returnText: string[];
    values: string[];
    trigger: string[];
    switch_checkbox: BooleanString[];
}

export interface StateRowEditPopupCard {
    rows: RowsSetState[];
    trigger: string;
    showSelectId: boolean;
    selectIdValue: string;
    indexID: number;
    dropStart: number;
    dropEnd: number;
    dropOver: number;
    mouseOverNoneDraggable: boolean;
    itemForID: string;
    openCopyPopup: boolean;
    indexOfRowToCopyForModal: number;
    checkboxes: boolean[];
    isMinOneCheckboxChecked: boolean;
    copyModalOpen: boolean;
    copyToMenu: string;
    openRenameModal: boolean;
    isValueChanged: boolean;
    triggerName: string;
    renamedTriggerName: string;
    saveData: SaveDataObject;
    targetCheckboxes: { [key: number]: boolean };
    isValueOk: boolean;
}

export interface RowsSetState {
    IDs: string;
    ack: ActionNewRowProps;
    confirm: BooleanString;
    parse_mode: BooleanString;
    returnText: string;
    values: string;
    trigger: string;
    switch_checkbox: BooleanString;
}

export interface TriggerObject {
    unUsedTrigger: string[];
    everyTrigger: Record<string, any>;
    usedTrigger: {
        nav: Record<string, any>;
        action: Record<string, any>;
    };
}

export interface PropsDropBox {
    callback: CallbackFunctionsApp;
    data: DataDropBox;
    index: number | null;
}

export interface StateDropBox {
    inDropBox: boolean;
    menuList: string[];
    selectedMenu: string;
    selectedValue: 'move' | 'copy';
    openRenamePopup: boolean;
    trigger: string;
    newTrigger: string;
    usedTrigger: string[];
    rowToWorkWith: DataRow;
    isOK: boolean;
    oldTrigger: string;
}

export interface PropsRenameCard {
    id: string;
    callback: { setState: SetStateFunction };
    value?: string;
}

export interface PropsTriggerOverview {
    data: NativeData;
    usersInGroup: MenusWithUsers;
    userActiveCheckbox: UserActiveCheckbox;
}

export interface StateTriggerOverview {
    ulPadding: { [key: string]: number };
    trigger: TriggerObj | undefined | null;
    selected: string;
    options: string[];
}

export interface TriggerObj {
    unUsedTrigger: string[];
    everyTrigger: { [key: string]: string[] };
    usedTrigger: { nav: { [key: string]: string[] }; action: { [key: string]: { [key: string]: string[] } } };
}

export interface MenuWithUser {
    menu: string;
    index: number;
}

export interface PropsSquare {
    color: string;
    trigger?: string;
    position: number;
    noText?: boolean;
}

export interface StateSquare {
    bColor: string;
    width: number;
    color: string;
    text: string;
    left: string;
    fontWeight: string;
}

export interface PropsHeaderTelegramUsers {
    callback: CallbackFunctionsApp;
    data: {
        state: TelegramMenuApp.AdditionalState;
        activeMenu: string;
        usersInGroup: MenusWithUsers;
        userActiveCheckbox: UserActiveCheckbox;
        menuOpen: boolean;
    };
}

export interface StateHeaderTelegramUsers {
    errorUserChecked: boolean;
    menuChecked: boolean;
}

export interface PropsHeaderMenu {
    data: DataMainContent;
    callback: CallbackFunctionsApp;
    children?: ReactNode;
}

export interface PropsBtnCard {
    callback: CallbackFunctionsApp;
    data: DataMainContent;
}

export interface StateBtnCard {
    oldMenuName: string;
    newMenuName: string;
    renamedMenuName: string;
    confirmDialog: boolean;
    renameDialog: boolean;
    menuNameExists: boolean;
    isOK: boolean;
}

export interface PropsMenuPopupCard {
    usersInGroup: MenusWithUsers;
    callback: CallbackFunctionsApp;
}

export interface Native {
    dropbox: Dropbox.Position;
    usersInGroup: MenusWithUsers;
    instanceList?: InstanceList[];
    instance: string;
    data: NativeData;
    checkbox: Checkboxes;
    usersForGlobal: string;
    tokenGrafana: string;
    directory: string;
    userActiveCheckbox: UserActiveCheckbox;
    textNoEntry: string;
    userListWithChatID: UserListWithChatID[];
    description: DescriptionRow[];
}

export interface Checkboxes {
    oneTiKey: boolean;
    resKey: boolean;
    checkboxNoValueFound: boolean;
    sendMenuAfterRestart: boolean;
}

export interface InstanceList {
    active: boolean;
    name: string;
}

export interface UserListWithChatID {
    name: string;
    chatID: string;
    instance: string;
}

export type UserActiveCheckbox = { [key: string]: boolean };

export interface NativeData {
    action: ActionData;
    nav: NavData;
}

export interface ActionData {
    [key: string]: Actions;
}

export interface Actions {
    get: GetAction[];
    set: SetAction[];
    pic: Pic[];
    httpRequest: HttpRequest[];
    echarts: Echart[];
    events: EventAction[];
}

export type DataRow = DataRowAction | RowsNav;
export type DataRowAction = GetAction | SetAction | Pic | HttpRequest | Echart | EventAction;

export interface HttpRequest {
    url: string[];
    user: string[];
    password: string[];
    filename: string[];
    trigger: string[];
    delay: string[];
}

export interface SetAction {
    ack: BooleanString[] | undefined;
    confirm: BooleanString[];
    parse_mode: BooleanString[];
    switch_checkbox: BooleanString[];
    IDs: string[];
    returnText: string[];
    trigger: string[];
    values: string[];
}

export interface GetAction {
    newline_checkbox: BooleanString[];
    parse_mode: BooleanString[];
    IDs: string[];
    text: string[];
    trigger: string[];
}

export interface EventAction {
    ack: BooleanString[];
    ID: string[];
    menu: string[];
    condition: string[];
}

export interface Pic {
    IDs: string[];
    filename: string[];
    trigger: string[];
    picSendDelay: string[];
}

export interface Echart {
    background: string[];
    echartsInstance: string[];
    filename: string[];
    preset: string;
    theme: string[];
    trigger: string[];
}

export interface PropsMainTabList {
    callback: CallbackFunctionsApp;
    data: DataMainContent;
}

export interface PropsMainActions {
    data: DataMainContent;
    callback: CallbackFunctionsApp;
}

export interface CallbackFunctions {
    setState: SetStateFunction;
    updateNative: UpdateNativeFunction;
}

export interface CallbackFunctionsApp {
    setStateApp: SetStateFunction;
    updateNative: UpdateNativeFunction;
}

export interface PropsMainTriggerOverview {
    state: TelegramMenuApp.AdditionalState;
    callback: CallbackFunctions;
}

export interface PropsMainDoubleTriggerInfo {
    state: TelegramMenuApp.AdditionalState;
}

export interface PropsMainContent {
    data: DataMainContent;
    callback: CallbackFunctionsApp;
}

export interface DataMainContent {
    state: TelegramMenuApp.AdditionalState;
    adapterName: string;
    socket: Socket;
}

export type Socket = AdminConnection;

export interface PropsMainDropBox {
    callback: CallbackFunctionsApp;
    data: DataDropBox;
}

export interface DataDropBox {
    dropBoxRef: Dropbox.Ref;
    state: TelegramMenuApp.AdditionalState;
}

export interface ShowButtons {
    add: boolean;
    edit: boolean;
    moveUp?: boolean;
    moveDown?: boolean;
    remove: boolean;
}

export interface TabListingType {
    label: string;
    value: string;
}

export interface RowForButton {
    trigger?: string[];
    parse_mode: string[];
    call: string;
}

export namespace Dropbox {
    export type newX = Nullable<number>;
    export type newY = Nullable<number>;
    export type Ref = React.RefObject<HTMLDivElement | null> | undefined | null;

    export interface Position {
        dropboxTop: number;
        dropboxRight: number;
    }
}

export type TriggerableActions = GetAction | SetAction | Pic | HttpRequest | Echart;
