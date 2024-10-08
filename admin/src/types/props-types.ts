import {
	CallbackFunctionsApp,
	CallbackTabActionContent,
	Data,
	DataMainContent,
	DataTabActionContent,
	RowsSetState,
	StateTabNavigation,
	TabActionContentTableProps,
	TabValueEntries,
	TabValues,
} from "../../app";
import { SetStateFunction } from "admin/app";
import { EventButton } from "./event";
import { ShowButtons, RowForButton } from "../../app";
import AppContentTabActionContentRowEditorTableHead from "@/pages/AppContentTabActionContentRowEditorTableHead";

export interface AppContentTabActionContentRowEditorButtonsProps {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { rows: RowsSetState[]; indexRow: number };
	callback: CallbackFunctionsApp & CallbackTabActionContent & { setStateEditor: SetStateFunction };
}

export interface PropsMainTabs {
	callback: CallbackFunctionsApp;
	data: DataMainContent;
}

export interface PropsTableNavEditRow {
	state: StateTabNavigation;
	setState: SetStateFunction;
	data: DataMainContent & { entries: TabValueEntries[] };
	entries: TabValueEntries[];
	popupRowCard: ({}: EventButton) => void;
}

export interface BtnCircleAddTypeProps {
	callback: () => void;
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

export interface PropsActionEditHeader {
	tab: TabValues;
	callback: { checkAll: (check) => void };
	setRef: (ref: AppContentTabActionContentRowEditorTableHead) => void;
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
