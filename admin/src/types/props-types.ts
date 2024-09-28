import { PopupCardButtons, SetStateFunction } from "admin/app";
import { ActionNewRowProps, CallbackFunctionsApp, CallbackTabActionContent, Data, DataMainContent, RowsSetState, TabValueEntries } from "../../app";
export interface AppContentTabActionContentRowEditorButtonsProps {
	buttons: PopupCardButtons;
	newRow: ActionNewRowProps;
	entries: TabValueEntries[];
	indexRow: number;
	rows: RowsSetState[];
	setState: SetStateFunction;
	data: Data;
	callback: CallbackFunctionsApp & CallbackTabActionContent;
}

export interface PropsMainTabs {
	callback: CallbackFunctionsApp;
	data: DataMainContent;
}
