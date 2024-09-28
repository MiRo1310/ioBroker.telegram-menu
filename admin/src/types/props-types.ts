import { RowsSetState, TabValueEntries, ActionNewRowProps, Data, CallbackFunctionsApp, Socket, DataMainContent } from '../../app';
import { SetStateFunction, PopupCardButtons, CallbackFunctions, AdditionalStateInfo } from 'admin/app';
export interface AppContentTabActionContentRowEditorButtonsProps {
    buttons: PopupCardButtons;
    newRow: ActionNewRowProps;
    entries: TabValueEntries[];
    indexRow: number;
    rows: RowsSetState[];
    setState: SetStateFunction;
    data: Data
    callbackFromAppTsx: CallbackFunctions;
}

export interface PropsMainTabs {
    callback: CallbackFunctionsApp;
    data: DataMainContent
}