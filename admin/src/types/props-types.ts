import { RowsSetState, TabValueEntries, ActionNewRowProps } from '../../app';
import { SetStateFunction, PopupCardButtons } from 'admin/app';
export interface AppContentTabActionContentRowEditorButtonsProps {
    buttons: PopupCardButtons;
    newRow: ActionNewRowProps;
    entries: TabValueEntries[];
    indexRow: number;
    rows: RowsSetState[];
    setState: SetStateFunction;
}