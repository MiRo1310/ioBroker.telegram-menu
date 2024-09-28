import {
	CallbackFunctionsApp,
	CallbackTabActionContent,
	DataMainContent,
	DataTabActionContent,
	RowsSetState,
	TabActionContentTableProps,
} from "../../app";
import { SetStateFunction } from "admin/app";
export interface AppContentTabActionContentRowEditorButtonsProps {
	data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { rows: RowsSetState[]; indexRow: number };
	callback: CallbackFunctionsApp & CallbackTabActionContent & { setStateEditor: SetStateFunction };
}

export interface PropsMainTabs {
	callback: CallbackFunctionsApp;
	data: DataMainContent;
}
