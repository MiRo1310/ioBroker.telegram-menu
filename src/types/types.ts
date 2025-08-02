import type { MockAdapter } from '@iobroker/testing';
import type TelegramMenu from '../main';
import type {
    BooleanString,
    Echart,
    EventAction,
    GetAction,
    HttpRequest,
    Pic,
    RowsNav,
    SetAction,
    UserActiveCheckbox,
    UserListWithChatID,
} from '@/types/app';

export type ListOfMenus = string[];

export type Action = Record<string, Actions>;

export type Navigation = string[][];

export interface InstanceList {
    active?: boolean;
    name?: string;
}

export interface Actions {
    get: GetAction[];
    set: SetAction[];
    pic: Pic[];
    httpRequest: HttpRequest[];
    echarts: Echart[];
    events: EventAction[];
}

export type StartSides = Record<string, string>;

export type NewObjectStructure = Record<string, Part>;

export type MenuData = Record<string, NewObjectStructure>;

export interface DataObject {
    action?: Record<string, Actions | undefined>;
    nav: Record<string, RowsNav[]>;
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
    echarts?: ModifiedEchart[];
    httpRequest?: ModifiedHttpRequest[];
    url?: string;
    user?: string;
    password?: string;
    filename?: string;
}

export interface ModifiedEchart {
    background: string;
    echartsInstance: string;
    filename: string;
    preset: string;
    theme: string;
}

export interface SendPic {
    delay: number;
    id: string;
    fileName: string;
}

export interface ModifiedHttpRequest {
    url: string;
    user: string;
    password: string;
    filename: string;
    delay: string;
}

export interface GetData {
    id: string;
    text: string;
    parse_mode: boolean;
    newline: BooleanString;
}

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
    navToGoTo?: string;
}

export type Newline = BooleanString;

export interface BindingObject {
    values: Record<string, string>;
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
    navToGoTo: string;
    menus: string[];
    isUserActiveCheckbox: UserActiveCheckbox;
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
    isUserActiveCheckbox: UserActiveCheckbox;
    token: string;
    directoryPicture: string;
    timeoutKey: string;
    groupData: NewObjectStructure;
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

export interface TelegramParams {
    telegramInstanceList: InstanceList[];
    telegramInstance?: string;
    resize_keyboard: boolean;
    one_time_keyboard: boolean;
    userListWithChatID: UserListWithChatID[];
}

export interface SetMenuValue {
    part: Part;
    userToSend: string;
    telegramParams: TelegramParams;
    menuNumber: 1 | 2;
}

export interface CreateMenu {
    cbData: string;
    menuToHandle: string;
    text?: string;
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

export interface CallSubMenu {
    jsonStringNav: string;
    userToSend: string;
    telegramParams: TelegramParams;
    part: Part;
    allMenusWithData: AllMenusWithData;
    menus: string[];
}
