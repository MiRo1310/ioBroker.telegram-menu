import { RowsSetState, TabValueEntries, ActionNewRowProps, Data } from '../app';
import { SetStateFunction, PopupCardButtons, CallbackFunctions } from 'admin/app';
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