interface Checkboxes {
    oneTiKey: boolean;
    resKey: boolean;
    checkboxNoValueFound: boolean;
    sendMenuAfterRestart: boolean;
}
type ListOfMenus = string[]
interface IsUserActiveCheckbox {
    [key: string]: boolean;
}
type Menus = string
interface MenusWithUsers {
    [key: Menus]: string[];
}
interface UserListWithChatId {
    chatID: string;
    name: string;
}
interface DataObject {
    action: Action
    nav: { [key: string]: Nav[] }
    [key: Menus]: Nav
}
interface Action {
    [key: string]: Actions
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
interface StartSides {
    [key: Menus]: string
}

interface MenuData {
    data: {
        [key: string]: DataObject
    }
    [key: string?]: { nav: string[] }
}
interface GeneratedActions {
    obj: DataObject, ids: string[]
}
interface UserObject {
    [key: string]: { switch?: Switch[] }
    [key: string]: { [key: UserObjectActions]: [] }
}

interface UserObjectActions {
    [key: string]: {
        nav?: string[][]
        parse_mode?: BooleanString
        text?: string

        switch?: Switch[]

        echarts?: { background: string, echartsInstance: string, filename: string, preset: string, theme: string }[]
    }
}
interface Part {
    text?: string,
    nav?: any,
    parse_mode?: BooleanString,
    getData?: GetData[],
    switch?: Switch[],
    sendPic?: SendPic[]
    location?: Location[]
    echarts?: Echart[],
    httpRequest?: HttpRequest[],
    url?: string,
    user?: string,
    password?: string,
    filename?: string,

}
interface GetData {
    id: string,
    text: string,
    parse_mode: BooleanString,
    newline: BooleanString
}
type BooleanString = "false" | "true"
type ParseModeType = "HTML" | "Markdown"



interface SetDynamicValueObj {
    [key: string]: SetDynamicValue
}
interface SetDynamicValue {
    id: string,
    ack: boolean,
    returnText: string,
    userToSend: string,
    parse_mode: BooleanString,
    confirm: string,
    telegramInstance: string,
    one_time_keyboard: boolean,
    resize_keyboard: boolean,
    userListWithChatID: UserListWithChatId[],
    valueType: string
}
interface TelegramResult {
    error: string
}
interface DecomposeText {
    startindex: number, endindex: number, substring: string, textWithoutSubstring: string
}
type Newline = "true" | "false"
interface BindingObject {
    values: { [key: string]: string }
}
interface EditArrayButtons {
    value: string | string[] | string[][],
    call: string
    parse_mode: BooleanString
    text: string
}

type BooleanString = "true" | "false"


type UserObjectActions = string
interface Switch {
    id: string,
    value: string
    toggle: boolean
    confirm: BooleanString
    returnText: string
    parse_mode: BooleanString
    ack: BooleanString
}
type ValueType = "string" | "number" | "boolean"

interface Event {
    ack: boolean[],
    condition: string,
    ID: string,
    menu: string
}
interface SubscribeForeignStateArray {
    id: string
}
interface GenerateActionsArrayOfEntries {
    objName: string,
    name: string,
    loop: string,
    elements: GenerateActionsArrayOfElements[]
}
interface GenerateActionsArrayOfElements {
    name: string,
    value?: string
    key?: number
    type?: string
}
interface GenerateActionsNewObject {
    preset?: string
    echartsInstance?: string
    background?: string
    theme?: string
    url?: string
    user?: string
    password?: string
    id?: string,
    filename?: string,
    delay?: string
    text?: string
    newline?: BooleanString
    parse_mode?: BooleanString
}


interface UserInGroup {
    [key: string]: string[]
}
interface ReturnIdToListenTo {

}
type SplittedData = string[]
interface AllMenusWithData {
    [key: string]: { [key: string]: Nav }
    [key: string]: DataObject
}
interface SetStateIdsToListenTo {
}

interface SetStateIds {
    id: string,
    confirm: BooleanString | boolean,
    returnText: string,
    userToSend: string,
    parse_mode?: BooleanString
}
interface Timeouts {
    key: string
    timeout: NodeJS.Timeout
}
interface TimeoutToClear {
    key: string,
    timeout: NodeJS.Timeout
}
interface GroupWithUser {

}
interface Menu {

}
interface Messages {
    [key: string]: Message[]
}
interface Message {
    time: number
}
type WhatShouldDelete = "all" | "last"
interface Keyboard {
    FirstRow?: FirstRow[],
    inline_keyboard: ArrayOfEntriesDynamicSwitch[][]
}
interface ArrayOfEntriesDynamicSwitch {
    text: string,
    callback_data: string
}

interface LastText {
    [key: string]: string
}
interface ValArray {
    [key: string]: string
}
interface FirstRow {
    text: string,
    callback_data: string
}
interface RowArray {
    [key: string]: string
}
interface Parts {
    httpRequest: Part[],

}
interface BackMenu {
    [key: string]: BackMenuList
}