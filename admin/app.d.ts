import { GenericAppProps, GenericAppState } from "@iobroker/adapter-react-v5";
import { Tab } from '@mui/material';
import { AdminConnection } from '@iobroker/socket-client';
import { LegacyRef, ReactNode } from "react";
import { EventButton } from "@components/btn-Input/button";
import { setState } from '../src/lib/setstate';
import { HelperText } from "@/config/helper";

export type Nullable<T> = T | null | undefined;

export interface AdditionalPropInfo extends GenericAppProps {
	themeName: string;
}
interface AppProps {
	encryptedFields: string[];
	Connection: AdminConnection;
	translations: any;
	// Fügen Sie hier weitere Eigenschaften hinzu, die `props` enthalten kann
}


export type ExtendedAppProps = AppProps & AdditionalPropInfo;
export interface AdditionalStateInfo extends GenericAppState {
	showDropBox: boolean;
	native: Native;
	connectionReady: boolean;
	activeMenu: string;
	usedTrigger: string[];
	dropDifferenzX: number;
	dropDifferenzY: number;
	instances: string[];
	doubleTrigger: string[];
	unUsedTrigger: string[];
	triggerObject: TriggerObject;
	tab: string;
	popupMenuOpen: boolean;
	subTab: string;
	draggingRowIndex: number | null;
	showTriggerInfo: boolean;
	data: {};
	showPopupMenuList: boolean;
	dropBoxTop: number;
	dropBoxRight: number;
	copyDataObject: { targetCheckboxes: { [key: number]: boolean }, targetActionName: string };

}

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
	data: DataMainContent & { entries: TabValueEntries[] }
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
	buttons: PopupCardButtons, width: string, height: string
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
export type ObjectBrowserType = 'state' | 'instance' | 'channel' | 'device' | 'chart'
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
export type UpdateNative = {
	updateNative: UpdateNativeFunction;
};
export interface SetState {
	setState: SetStateFunction;
}

export interface PropsTableDndNav {
	card: string;
	openAddRowCard: ({ }: EventButton) => void;
	showButtons: ShowButtons;
	data: DataMainContent & { entries: TabValueEntries[] }
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
	data: DataMainContent
	callback: CallbackFunctionsApp;
}

export interface Data {
	activeMenu?: string;
	nav?: NavData;
	state: AdditionalStateInfo;
	data?: NativeData;
	action?: ActionData;
	socket?: Socket;
	themeName?: string;
	themeType?: string;
	adapterName?: string;
	unUsedTrigger?: string[];
	usersInGroup?: UsersInGroup;
	userActiveCheckbox?: UserActiveCheckbox;
}

export type UsersInGroup = { [key: string]: string[] };
export type socket = AdminConnection;

export interface StateTabAction {
	value: string;
}
export interface ButtonSmallProps {
	index?: number;
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
	callback: Function;
	callbackValue?: CallbackValue;
	id?: string;
	setNative?: boolean;
	title?: string;
	name?: string;
	disabled?: string | boolean;
	className?: string;
	children?: ReactNode;
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
	width?: string;
	marginLeft?: string;
	marginTop?: string;
	class?: string;
}

export interface PropsRowNavCard {
	entries: TabValueEntries[];
	newRow: RowsNav;
	callback: { onChangeInput: (data: ChangeInputNav) => void, onChangeCheckbox: (data: EventCheckbox) => void };
	inUse: boolean;
	openHelperText: (value: string) => void;
}
export interface ChangeInputNav {
	id: string;
	val: string;
}
export interface Entries {
	name: string;
	checkbox: boolean;
	editWidth: string;
	headline: string;
	width: number;
	val: string;
	title: string;
}
export interface SelectProps {
	id: string;
	name?: string;
	label?: string;
	placeholder?: string;
	options: string[];
	selected: string;
	callback: ({ }: EventSelect) => void;
	setNative?: boolean;
	width?: string;
	callbackValue?: CallbackValue;
}
export type UpdateNativeFunction = (key: string, value?: any, cb?: () => void) => void;
export interface InputProps {
	id: string;
	type?: string;
	placeholder?: string;
	value: string;
	callback: SetStateFunction;
	label?: string;
	spellCheck?: boolean;
	width?: string | number;
	inputWidth?: string;
	margin?: string;
	class?: string;
	children?: ReactNode;
	index?: number;
	disabled?: boolean;
	setState?: SetStateFunction;
	onMouseOver?: (e: React.MouseEvent<HTMLInputElement> | undefined, setState: SetStateFunction | undefined) => void;
	onMouseLeave?: (e: React.MouseEvent<HTMLInputElement> | undefined, setState: SetStateFunction | undefined) => void;
	callbackValue?: CallbackValue;
	className?: string;
}
export interface PropsHeaderIconBar {
	instance: number;
	common: ioBroker.InstanceCommon | null;
	native: Native;
	onLoad: (error: Record<string, null>) => void;
	onError: (text: string | number) => void;
	adapterName: string;
	changed: boolean;
	onChange: UpdateNativeFunction;
}
export interface PropsHelperCard {
	helper: {};
	val: string;
	editedValueFromHelperText: string;
	setState: SetStateFunction;
	data: { adapterName?: string, themeType?: string, socket?: socket };
	callback: (val: EventButton) => void;
	name: string;
	text: string;
	helperTextForInput: string;
}
export interface StateHelperCard {
	rows: HelperText["get"] | HelperText["set"] | HelperText["nav"];
	showSelectId: boolean;
	selectedId: string;
}
export type SetStateFunction = React.Component["setState"];
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
	onMouseOver?: (e: React.MouseEvent<HTMLTextAreaElement> | undefined
		, setState: SetStateFunction | undefined) => void;
	onMouseLeave?: (e: React.MouseEvent<HTMLTextAreaElement> | undefined
		, setState: SetStateFunction | undefined) => void;
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
	data: DataMainContent & TabActionContentTableProps
	callback: CallbackFunctionsApp;
}
export interface TabActionContentTableProps { tab: TabValues; card: string; showButtons: ShowButtons; }

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
	data: DataMainContent & TabActionContentTableProps
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
	name: string;
	chatID: string;
	data: {
		state: AdditionalStateInfo;
		activeMenu: string;
		usersInGroup: UsersInGroup;
		userActiveCheckbox: UserActiveCheckbox
	};
	callback: CallbackFunctionsApp;
	setState: SetStateFunction;
	class?: string;
	key?: number;
}
export interface StateTelegramUserCard {
	usersInGroup: UsersInGroup;
	name: string;
	activeMenu: string;
}
export interface PropsPopupContainer {
	title: string;
	isOK?: boolean;
	closeBtn?: boolean;
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
	onDragStart?: (event: React.DragEvent<HTMLDivElement> | undefined, setState: SetStateFunction | undefined) => void;
	onDragEnd?: (event: React.DragEvent<HTMLDivElement> | undefined, setState: SetStateFunction | undefined) => void;
	onDragOver?: (event: React.DragEvent<HTMLDivElement> | undefined, setState: SetStateFunction | undefined) => void;
	onDrop?: (event: React.DragEvent<HTMLDivElement> | undefined, setState: SetStateFunction | undefined) => void;
	onDrag?: (event: React.DragEvent<HTMLDivElement> | undefined, setState: SetStateFunction | undefined) => void;
	onMouseEnter?: (event: React.MouseEvent<HTMLDivElement> | undefined
		, setState: SetStateFunction | undefined) => void;
	onMouseLeave?: (event: React.MouseEvent<HTMLDivElement> | undefined
		, setState: SetStateFunction | undefined) => void;
	callback: (val) => void;
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
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { rowIndexToEdit: number }
	callback: CallbackFunctionsApp & CallbackTabActionContent & { openHelperText: (value: { subCard: string; entry: string; index: number }) => void }
}
export interface DataTabActionContent { newRow: ActionNewRowProps; newUnUsedTrigger: string[]; }

export interface CallbackTabActionContent {
	setStateTabActionContent: SetStateFunction;
}

export type BooleanString = "true" | "false";

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
	openCopyPopup: boolean,
	indexOfRowToCopyForModal: number,
	checkboxes: boolean[];
	isMinOneCheckboxChecked: boolean
	copyModalOpen: boolean;
	copyToMenu: string;
	openRenameModal: boolean;
	isValueChanged: boolean;
	triggerName: string;
	renamedTriggerName: string;
	saveData: SaveDataObject
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

export interface AppState {
	selectedTab: string;
	selectedTabNum: number;
	native: {};
	errorText: string;
	changed: boolean;
	connected: boolean;
	loaded: boolean;
	isConfigurationError: string;
	expertMode: boolean;
	toast: string;
	theme: import("./src/types").Theme;
	themeName: string;
	themeType: string;
	bottomButtons: boolean;
	width: import("./src/types").Width;
	confirmClose: boolean;
	_alert: boolean;
	_alertType: string;
	_alertMessage: string;
	showDropBox: boolean;
}

export interface TriggerObject {
	unUsedTrigger: string[];
	everyTrigger: {};
	usedTrigger: {
		nav: {};
		action: {};
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
	selectedValue: string;
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

export interface StateRenameCard { }
export interface PropsTriggerOverview {
	data: NativeData;
	usersInGroup: UsersInGroup;
	userActiveCheckbox: UserActiveCheckbox;
}
export interface StateTriggerOverview {
	ulPadding: { [key: string]: number };
	trigger: TriggerObj | undefined | null;
	groupsOfMenus: any;
	selected: string;
	options: string[];
}
// FIXME - any
export interface TriggerObj {
	unUsedTrigger: string[];
	everyTrigger: { [key: string]: string[] };
	usedTrigger: { nav: { [key: string]: string[] }; action: any };
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
	data: { state: AdditionalStateInfo, activeMenu: string, usersInGroup: UsersInGroup, userActiveCheckbox: UserActiveCheckbox };
}
export interface StateHeaderTelegramUsers {
	menuOpen: boolean;
	errorUserChecked: boolean;
	menuChecked: boolean;
}
export interface PropsHeaderMenu {
	data: DataMainContent;
	callback: CallbackFunctionsApp;
}
export interface PropsBtnCard {
	callback: CallbackFunctionsApp;
	data: DataMainContent
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
	usersInGroup: UsersInGroup;
	callback: CallbackFunctionsApp;
}
export interface PropsMenuButton {
	b_color?: string;
	color?: string;
	title?: string;
	onChangeValue?: () => void;
	children?: ReactNode;
}

export interface Native {
	dropbox: DropBoxType;
	usersInGroup: UsersInGroup;
	instance: string;
	data: NativeData;
	checkbox: {
		sendMenuAfterRestart: boolean;
		checkboxNoValueFound: boolean;
		resKey: boolean;
		oneTiKey: boolean;
	};
	usersForGlobal: string;
	tokenGrafana: string;
	directory: string;
	userActiveCheckbox: UserActiveCheckbox
	textNoEntry: string;
	userListWithChatID: { name: string, chatID: string }[];
}

export interface DropBoxType {
	dropboxTop: number;
	dropboxRight: number;
}
export type UserActiveCheckbox = { [key: string]: boolean };
export interface NativeData {
	action: ActionData;
	nav: NavData;
}
export interface ActionData { [key: string]: Actions }
export interface Actions {
	get: Get[];
	set: Set[];
	pic: Pic[];
	httpRequest: HttpRequest[];
	echarts: Echart[];
	events: Events[];
}
export type ActionTabs = Get[] | Set[] | Pic[] | HttpRequest[] | Echart[] | Events[];
export type DataRow = Get | Set | Pic | HttpRequest | Echart | Events | RowsNav;
export type DataRowAction = Get | Set | Pic | HttpRequest | Echart | Events;

export interface HttpRequest {
	url: string[];
	user: string[];
	password: string[];
	filename: string[];
	trigger: string[];
	delay: string[];
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
	ack: BooleanString[];
	ID: string[];
	menu: string[];
	condition: string;
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
	state: AdditionalStateInfo;
	callback: CallbackFunctions;
}
export interface PropsMainDoubleTriggerInfo {
	state: AdditionalStateInfo;
}
export interface PropsMainContent {
	data: DataMainContent;
	callback: CallbackFunctionsApp;
}
export interface DataMainContent { state: AdditionalStateInfo, adapterName: string, socket: Socket }
//FIXME - Evtl passt das nicht
export type Socket = AdminConnection;

export interface PropsMainDropBox {
	callback: CallbackFunctionsApp;
	data: DataDropBox;
}
export interface DataDropBox {
	dropBoxRef: LegacyRef<HTMLDivElement> | undefined,
	state: AdditionalStateInfo
}
export interface PropsTableNavHeader {
	entries: TabValueEntries[];
}

export interface PropsTableNavHelper {
	state: StateTabNavigation;
	setState: SetStateFunction;
	data: Data;
	popupHelperCard: (isOkay: boolean) => void;
}

export interface PropsActionEditHeader {
	tab: TabValues
	callback: { checkAll: (check) => void };
	setRef: (ref: AppContentTabActionContentRowEditorTableHead) => void;
}

export interface PropsButtonCard {
	showButtons: ShowButtons;
	openAddRowCard: (val: EventButton) => void;
	editRow: (e: EventButton) => void;
	moveUp: (e: EventButton) => void;
	moveDown: (e: EventButton) => void;
	deleteRow: (e: EventButton) => void;
	index: number;
	rows: RowForButton[];
	notShowDelete?: boolean;
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
	trigger: string;
	parse_mode: string[];
	call: string;


}
export interface EventCheckbox {
	isChecked: boolean;
	id: string;
	index: number;
}