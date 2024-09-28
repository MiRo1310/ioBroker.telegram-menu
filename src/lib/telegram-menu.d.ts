interface Checkboxes {
	oneTiKey: boolean;
	resKey: boolean;
	checkboxNoValueFound: boolean;
	sendMenuAfterRestart: boolean;
}
type ListOfMenus = string[];
interface IsUserActiveCheckbox {
	[key: string]: boolean;
}
type MenusArray = keyof NewObjectNavStructure[];
type Menus = string;
interface MenusWithUsers {
	[key: string]: string[];
}
interface UserListWithChatId {
	chatID: string;
	name: string;
}

interface Action {
	[key: string]: Actions;
}
interface Actions {
	get: Get[];
	set: Set[];
	pic: Pic[];
	httpRequest: HttpRequest[];
	echarts: Echart[];
	events: Events[];
}
interface HttpRequest {
	url: string;
	user: string;
	password: string;
	filename: string;
	trigger: string;
	delay: string;
}

type NavPart = string[] | string[][];
interface NavObject {
	[key: string]: Nav[];
}

interface NavStaticValues {
	call: string;
	text: string;
	parse_mode: BooleanString;
}
interface Set {
	ack: BooleanString[];
	confirm: BooleanString[];
	parse_mode: BooleanString[];
	switch_checkbox: BooleanString[];
	IDs: string[];
	returnText: string[];
	trigger: string[];
	values: string[];
}
interface Get {
	newline_checkbox: BooleanString[];
	parse_mode: BooleanString[];
	IDs: string[];
	text: string[];
	trigger: string[];
}
interface Events {
	ack: BooleanString[];
	ID: string[];
	menu: string[];
	condition: string;
	trigger: string[];
}
interface Pic {
	IDs: string[];
	filename: string[];
	trigger: string[];
	picSendDelay: string[];
}
interface Echart {
	background: string[];
	echartsInstance: string[];
	filename: string[];
	preset: string;
	theme: string[];
	trigger: string[];
}
interface StartSides {
	[key: Menus]: string;
}
interface NewObjectNavStructure {
	[key: NewObjectNavStructureKey]: Part;
}

type NewObjectNavStructureKey = string;

interface Nav extends NavStaticValues {
	nav: string;
	value: string;
}
interface MenuData {
	data: AllMenusWithData;
	[key: string?]: { nav: string[] };
}
interface AllMenusWithData {
	[key: MenuNames]: NewObjectNavStructure;
	[key: string]: DataObject;
}
type MenuNames = string;

export interface DataObject {
	action: Action;
	nav: NavObject;
	[key: MenusArray]: Nav;
}
interface GeneratedActions {
	obj: NewObjectNavStructure;
	ids: string[];
}
interface UserObject {
	[key: string]: { switch?: Switch[] };
	[key: string]: { [key: UserObjectActions]: [] };
}

interface UserObjectActions {
	[key: string]: {
		nav?: string[][];
		parse_mode?: BooleanString;
		text?: string;

		switch?: Switch[];

		echarts?: { background: string; echartsInstance: string; filename: string; preset: string; theme: string }[];
	};
}

interface Part {
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

interface GetData {
	id: string;
	text: string;
	parse_mode: BooleanString;
	newline: BooleanString;
}
type BooleanString = "false" | "true";
type ParseModeType = "HTML" | "Markdown";

interface SetDynamicValueObj {
	[key: string]: SetDynamicValue;
}
interface SetDynamicValue {
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
interface TelegramResult {
	error: string;
}
interface DecomposeText {
	startindex: number;
	endindex: number;
	substring: string;
	textWithoutSubstring: string;
}
type Newline = "true" | "false";
interface BindingObject {
	values: { [key: string]: string };
}

interface EditArrayButtons extends NavStaticValues {
	value: string;
}

interface GeneratedNavMenu extends NavStaticValues {
	nav: string[] | string[][];
}

type BooleanString = "true" | "false";

type UserObjectActions = string;
interface Switch {
	id: string;
	value: string;
	toggle: boolean;
	confirm: BooleanString;
	returnText: string;
	parse_mode: BooleanString;
	ack: BooleanString;
}
type ValueType = "string" | "number" | "boolean";

interface Event {
	ack: boolean[];
	condition: string;
	ID: string;
	menu: string;
}

interface GenerateActionsArrayOfEntries {
	objName: string;
	name: string;
	loop: string;
	elements: GenerateActionsArrayOfElements[];
}
interface GenerateActionsArrayOfElements {
	name: string;
	value?: string;
	key?: number;
	type?: string;
}
interface GenerateActionsNewObject {
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

interface UserInGroup {
	[key: string]: string[];
}
interface ReturnIdToListenTo { }
type SplittedData = string[];

interface SetStateIds {
	id: string;
	confirm: BooleanString | boolean;
	returnText: string;
	userToSend: string;
	parse_mode?: BooleanString;
}
interface Timeouts {
	key: string;
	timeout: iobroker.Timeout;
}
interface TimeoutToClear {
	key: string;
	timeout: NodeJS.Timeout;
}
type GroupWithUser = string;
interface Menu { }
interface Messages {
	[key: string]: Message[];
}
interface Message {
	time: number;
}
type WhatShouldDelete = "all" | "last";
interface Keyboard {
	FirstRow?: FirstRow[];
	inline_keyboard: ArrayOfEntriesDynamicSwitch[][];
}
interface ArrayOfEntriesDynamicSwitch {
	text: string;
	callback_data: string;
}

interface LastText {
	[key: string]: string;
}
interface ValArray {
	[key: string]: string;
}
interface FirstRow {
	text: string;
	callback_data: string;
}
interface RowArray {
	[key: string]: string;
}

interface BackMenu {
	[key: string]: BackMenuList;
}
interface CheckEveryMenuForDataType {
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
interface ProcessDataType {
	_this: any;
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
type ProzessTimeValue = (textToSend: string, obj: ioBroker.State) => string;

interface SetValueForSubmenuNumber extends GlobalTelegramValues {
	callbackData: string;
	calledValue: string;
	userListWithChatID: UserListWithChatId[];
	part: Part;
}
interface BackMenuType extends GlobalTelegramValues {
	allMenusWithData: AllMenusWithData, menus: string[], userListWithChatID: UserListWithChatId[]
}
interface SetValueForSubmenuPercent extends GlobalTelegramValues {
	callbackData: string;
	calledValue: string;
	userListWithChatID: UserListWithChatId[];
	part: Part;
	allMenusWithData: { [key: string]: NewObjectNavStructure };
	menus: string[];
}
interface GlobalTelegramValues {
	instanceTelegram: string, resize_keyboard: boolean, one_time_keyboard: boolean, userToSend: string;
}
interface CreateSwitchMenu {
	callbackData: string;
	device2Switch: string;
	text: string | undefined;
}
interface SetFirstMenuValue extends GlobalTelegramValues {
	part: Part;
	userListWithChatID: UserListWithChatId[];
}
interface SetSecondMenuValue extends GlobalTelegramValues {
	part: Part;
	userListWithChatID: UserListWithChatId[];
}
interface CreateSubmenuNumber {
	callbackData: string;
	device2Switch: string;
	text: string | undefined;
}
interface CreateSubmenuPercent {
	callbackData: string;
	device2Switch: string;
	text: string | undefined;
}
interface SetDynamicValueType extends GlobalTelegramValues {
	val: string;
	part: Part;
	userListWithChatID: UserListWithChatId[];
}
interface DeleteMessageIds {
	userToSend: string;
	userListWithChatID: UserListWithChatId[];
	instanceTelegram: string;
	device2Switch: string;
	callbackData: string;
}
interface SplitText {
	calledValue: string;
}