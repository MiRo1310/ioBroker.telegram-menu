import {
	CallbackFunctionsApp,
	CallbackTabActionContent,
	DataMainContent,
	DataTabActionContent,
	RowsSetState,
	StateTabNavigation,
	TabActionContentTableProps,
	TabValueEntries,
} from "../../app";
import { SetStateFunction } from "admin/app";
import { EventButton } from "./event";
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
