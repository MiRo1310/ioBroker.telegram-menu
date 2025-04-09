export interface Checkboxes {
    oneTiKey: boolean;
    resKey: boolean;
    checkboxNoValueFound: boolean;
    sendMenuAfterRestart: boolean;
}

export type ListOfMenus = string[];

export interface IsUserActiveCheckbox {
    [key: string]: boolean;
}

export interface MenusWithUsers {
    [key: string]: string[];
}

export interface UserListWithChatId {
    chatID: string;
    name: string;
}

export interface Action {
    [key: string]: Actions;
}

export type ActionTypes = Get | Set | Pic | HttpRequest | Echart | Events;

export interface Actions {
    get: Get[];
    set: Set[];
    pic: Pic[];
    httpRequest: HttpRequest[];
    echarts: Echart[];
    events: Events[];
}

export interface HttpRequest {
    url: string;
    user: string;
    password: string;
    filename: string;
    trigger: string;
    delay: string;
}

export type NavPart = string[][];

export interface NavObject {
    [key: string]: Nav[];
}

export interface NavStaticValues {
    call: string;
    text: string;
    parse_mode: BooleanString;
}

export interface Set {
    ack: BooleanString[];
    confirm: BooleanString[];
    parse_mode: BooleanString[];
    switch_checkbox: BooleanString[];
    IDs: string[];
    returnText: string[];
    trigger: string[];
    values: string[];
}

export interface Get {
    newline_checkbox: BooleanString[];
    parse_mode: BooleanString[];
    IDs: string[];
    text: string[];
    trigger: string[];
}

export interface Events {
    ack: BooleanString;
    ID: string;
    menu: string;
    condition: string;
    trigger: string[];
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
    filename: string;
    preset: string;
    theme: string[];
    trigger: string[];
}

export interface StartSides {
    [key: string]: string;
}

export interface NewObjectNavStructure {
    [key: string]: Part;
}

export interface Nav extends NavStaticValues {
    nav: string;
    value: string;
}

export interface MenuData {
    [key: string]: MenuDataNav | AllMenusWithData;
    data: AllMenusWithData;
}

interface MenuDataNav {
    nav: string[];
}

export interface AllMenusWithData {
    [key: string]: NewObjectNavStructure | DataObject;
}

export interface DataObject {
    action: Action;
    nav: NavObject;
    [key: string]: Nav | Action | NavObject;
}

export interface GeneratedActions {
    obj: NewObjectNavStructure;
    ids: string[];
}

export interface UserObjectActions {
    [key: string]: {
        nav?: string[][];
        parse_mode?: BooleanString;
        text?: string;
        switch?: Switch[];
        echarts?: { background: string; echartsInstance: string; filename: string; preset: string; theme: string }[];
    };
}

export interface Part {
    text?: string;
    nav?: any;
    parse_mode?: BooleanString;
    getData?: GetData[];
    switch?: Switch[];
    sendPic?: SendPic[];
    location?: Location[];
    echarts?: Echart[];
    httpRequest?: HttpRequest[];
    url?: string;
    user?: string;
    password?: string;
    filename?: string;
}

export interface SendPic {
    // TODO: Define the type for SendPic

    delay: number;
    id: string;
    fileName: string;
}

export interface GetData {
    id: string;
    text: string;
    parse_mode: BooleanString;
    newline: BooleanString;
}

export type BooleanString = 'false' | 'true';
export type ParseModeType = 'HTML' | 'Markdown';
export type Location = any;

export interface SetDynamicValueObj {
    [key: string]: SetDynamicValue;
}

export interface SetDynamicValue {
    id: string;
    ack: boolean;
    returnText: string;
    userToSend: string;
    parse_mode: BooleanString;
    confirm: string;
    telegramInstance: string;
    one_time_keyboard: boolean;
    resize_keyboard: boolean;
    userListWithChatID: UserListWithChatId[];
    valueType: string;
}

export interface DecomposeText {
    startindex: number;
    endindex: number;
    substring: string;
    textWithoutSubstring: string;
}

export type Newline = 'true' | 'false';

export interface BindingObject {
    values: { [key: string]: string };
}

export interface EditArrayButtons extends NavStaticValues {
    value: string;
}

export interface GeneratedNavMenu extends NavStaticValues {
    nav: string[] | string[][];
}

export interface Switch {
    id: string;
    value: string;
    toggle: boolean;
    confirm: BooleanString;
    returnText: string;
    parse_mode: BooleanString;
    ack: BooleanString;
}

export interface GenerateActionsArrayOfEntries {
    objName: string;
    name: string;
    loop: string;
    elements: GenerateActionsArrayOfElements[];
}

export interface GenerateActionsArrayOfElements {
    name: string;
    value?: string;
    key?: number;
    type?: string;
}

export interface GenerateActionsNewObject {
    preset?: string;
    echartsInstance?: string;
    background?: string;
    theme?: string;
    url?: string;
    user?: string;
    password?: string;
    id?: string;
    filename?: string;
    delay?: string;
    text?: string;
    newline?: BooleanString;
    parse_mode?: BooleanString;
}

export interface UserInGroup {
    [key: string]: string[];
}

export type SplittedData = string[];

export interface SetStateIds {
    id: string;
    confirm: BooleanString | boolean;
    returnText: string;
    userToSend: string;
    parse_mode?: BooleanString;
}

export type GroupWithUser = string;

export interface Message {
    time: number;
}

export type WhatShouldDelete = 'all' | 'last';

export interface Keyboard {
    inline_keyboard: KeyboardItems[][];
}

export interface KeyboardItems {
    text: string;
    callback_data: string;
}

export interface LastText {
    [key: string]: string;
}

export interface ValArray {
    [key: string]: string;
}

export interface KeyboardItem {
    text: string;
    callback_data: string;
}

export interface BackMenu {
    [key: string]: BackMenuList;
}

// TODO : Define the type for BackMenuList
type BackMenuList = any;

export interface CheckEveryMenuForDataType {
    menuData: MenuData; // checked !!!!
    calledValue: string;
    userToSend: string;
    instanceTelegram: string;
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
    userListWithChatID: UserListWithChatId[];
    menus: string[];
    isUserActiveCheckbox: IsUserActiveCheckbox;
    token: string;
    directoryPicture: string;
    timeoutKey: string;
}

export interface ProcessDataType {
    menuData: MenuData;
    calledValue: string;
    userToSend: string;
    groupWithUser: GroupWithUser;
    instanceTelegram: string;
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
    userListWithChatID: UserListWithChatId[];
    allMenusWithData: AllMenusWithData;
    menus: string[];
    isUserActiveCheckbox: IsUserActiveCheckbox;
    token: string;
    directoryPicture: string;
    timeoutKey: string;
    groupData: NewObjectNavStructure;
}

export interface SetValueForSubmenuNumber extends GlobalTelegramValues {
    callbackData: string;
    calledValue: string;
    userListWithChatID: UserListWithChatId[];
    part: Part;
}

export interface BackMenuType extends GlobalTelegramValues {
    allMenusWithData: AllMenusWithData;
    menus: string[];
    userListWithChatID: UserListWithChatId[];
}

export interface SetValueForSubmenuPercent extends GlobalTelegramValues {
    callbackData: string;
    calledValue: string;
    userListWithChatID: UserListWithChatId[];
    part: Part;
    allMenusWithData: { [key: string]: NewObjectNavStructure };
    menus: string[];
}

export interface GlobalTelegramValues {
    instanceTelegram: string;
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
    userToSend: string;
}

export interface SetFirstMenuValue extends GlobalTelegramValues {
    part: Part;
    userListWithChatID: UserListWithChatId[];
}

export interface SetSecondMenuValue extends GlobalTelegramValues {
    part: Part;
    userListWithChatID: UserListWithChatId[];
}

export interface CreateMenu {
    callbackData: string;
    device2Switch: string;
    text?: string;
}

export interface SetDynamicValueType extends GlobalTelegramValues {
    val: string;
    part: Part;
    userListWithChatID: UserListWithChatId[];
}

export interface DeleteMessageIds {
    userToSend: string;
    userListWithChatID: UserListWithChatId[];
    instanceTelegram: string;
    device2Switch: string;
    callbackData: string;
}
