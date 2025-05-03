import type { MockAdapter } from '@iobroker/testing';
import type TelegramMenu from '../main';

export type ListOfMenus = string[];

export type IsUserActiveCheckbox = Record<string, boolean>;
export type MenusWithUsers = Record<string, string[]>;

export type Action = Record<string, Actions>;

export type Navigation = string[][];

export type ActionTypes = Get | Set | Pic | HttpRequest | Echart | Events;

export interface UserListWithChatId {
    chatID: string;
    name: string;
}

export interface Checkboxes {
    oneTiKey: boolean;
    resKey: boolean;
    checkboxNoValueFound: boolean;
    sendMenuAfterRestart: boolean;
}

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

export interface Set {
    ack: BooleanString[];
    confirm: BooleanString[];
    parse_mode: boolean[];
    switch_checkbox: BooleanString[];
    IDs: string[];
    returnText: string[];
    trigger: string[];
    values: string[];
}

export interface Get {
    newline_checkbox: BooleanString[];
    parse_mode: boolean[];
    IDs: string[];
    text: string[];
    trigger: string[];
}

export interface Events {
    ack: BooleanString[];
    ID: string[];
    menu: string[];
    condition: string[];
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

export type StartSides = Record<string, string>;

export type NewObjectStructure = Record<string, Part>;

export type UsersInGroup = { [key: string]: string[] };

export type MenuData = Record<string, NewObjectStructure>;

export interface DataObject {
    action: Record<string, Actions | undefined>;
    nav: Record<string, NavigationRow[]>;
}

export interface UserObjectActions {
    [key: string]: {
        nav?: string[][];
        parse_mode?: boolean;
        text?: string;
        switch?: Switch[];
        echarts?: { background: string; echartsInstance: string; filename: string; preset: string; theme: string }[];
    };
}

export interface Part {
    text?: string;
    nav?: Navigation;
    parse_mode?: boolean;
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
    parse_mode: boolean;
    newline: BooleanString;
}

export type BooleanString = 'false' | 'true';
export type ParseModeType = 'HTML' | 'Markdown';

export interface Location {
    latitude: string;
    longitude: string;
}

export interface SetDynamicValueObj {
    [key: string]: SetDynamicValue;
}

export interface SetDynamicValue {
    id: string;
    ack: boolean;
    returnText: string;
    userToSend: string;
    parse_mode: boolean;
    confirm: string;
    telegramParams: TelegramParams;
    valueType: string;
}

export type Newline = 'true' | 'false';

export interface BindingObject {
    values: Record<string, string>;
}

export interface NavigationRow {
    value: string;
    call: string;
    text: string;
    parse_mode: string;
}

export interface splittedNavigation {
    nav: string[][];
    call: string;
    text: string;
    parse_mode: boolean;
}

export interface Switch {
    id: string;
    value: string;
    toggle: boolean;
    confirm: BooleanString;
    returnText: string;
    parse_mode: boolean;
    ack: boolean;
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
    index?: number;
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
    newline?: string;
    parse_mode?: boolean;
}

export type SplittedData = string[];

export interface SetStateIds {
    id: string;
    confirm: BooleanString | boolean;
    returnText: string;
    userToSend: string;
    parse_mode?: boolean;
}

export type GroupWithUser = string;

export interface Message {
    time: number;
}

export type WhatShouldDelete = 'all' | 'last';

export type Keyboard = { inline_keyboard: KeyboardItems[][] } | string[][] | undefined;

export interface KeyboardItems {
    text: string;
    callback_data: string;
}

export type LastText = Record<string, string>;

export type ValArray = Record<string, string>;

export interface KeyboardItem {
    text: string;
    callback_data: string;
}

export type BackMenu = Record<string, BackMenuList | undefined>;

type BackMenuList = { list: string[]; last: string };

export interface CheckEveryMenuForDataType {
    menuData: MenuData; // checked !!!!
    calledValue: string;
    menus: string[];
    isUserActiveCheckbox: IsUserActiveCheckbox;
    token: string;
    directoryPicture: string;
    timeoutKey: string;
    userToSend: string;
    telegramParams: TelegramParams;
}

export interface ProcessDataType {
    menuData: MenuData;
    calledValue: string;
    groupWithUser: GroupWithUser;
    allMenusWithData: MenuData;
    menus: string[];
    isUserActiveCheckbox: IsUserActiveCheckbox;
    token: string;
    directoryPicture: string;
    timeoutKey: string;
    groupData: NewObjectStructure;
    userToSend: string;
    telegramParams: TelegramParams;
}

export interface SetValueForSubmenuNumber {
    callbackData: string;
    calledValue: string;
    part: Part;
    userToSend: string;
    telegramParams: TelegramParams;
}

export interface BackMenuType {
    allMenusWithData: MenuData;
    menus: string[];
    userToSend: string;
    telegramParams: TelegramParams;
}

export type AllMenusWithData = Record<string, NewObjectStructure>;

export interface SetValueForSubmenuPercent {
    callbackData: string;
    calledValue: string;
    part: Part;
    allMenusWithData: AllMenusWithData;
    menus: string[];
    userToSend: string;
    telegramParams: TelegramParams;
}

export interface TelegramParams {
    telegramInstance: string;
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
    userListWithChatID: UserListWithChatId[];
}

export interface SetFirstMenuValue {
    part: Part;
    userToSend: string;
    telegramParams: TelegramParams;
}

export interface SetSecondMenuValue {
    part: Part;
    userToSend: string;
    telegramParams: TelegramParams;
}

export interface CreateMenu {
    callbackData: string;
    device2Switch: string;
    text?: string;
}

export interface DeleteMessageIds {
    userToSend: string;
    telegramParams: TelegramParams;
    device2Switch: string;
    callbackData: string;
}

export interface ExchangeValueReturn {
    newValue: string | number | boolean;
    textToSend: string;
    error: boolean;
}

export type PrimitiveType = string | number | boolean;

export type Adapter = MockAdapter | TelegramMenu;

export interface Timeouts {
    key: string;
    timeout: ioBroker.Timeout;
}

export interface StringReplacerObj {
    val: string;
    newValue: string;
}

export interface DecomposeTextReturnType {
    startindex: number;
    endindex: number;
    substring: string;
    textExcludeSubstring: string;
    substringExcludeSearch: string;
}

export interface EvaluateReturnType {
    val: any;
    error: boolean;
}

export interface Telegram {
    textToSend?: string;
    keyboard?: Keyboard;
    parse_mode?: boolean;
    userToSend: string;
    telegramParams: TelegramParams;
}

export interface ExtractTimeValues {
    milliseconds: number;
    seconds: number;
    minutes: number;
    hours: number;
    day: number;
    month: number;
    year: number;
}

export interface GetTimeWithPad {
    ms: string;
    s: string;
    m: string;
    h: string;
    d: string;
    mo: string;
    y: string;
}

export type Messages = Record<string, MessageInfos[]>;

export interface MessageInfos {
    id: ioBroker.StateValue;
    time?: number;
    request?: ioBroker.StateValue | null | undefined;
}
