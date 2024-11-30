import type {
    ActionNewRowProps,
    AppData,
    CallbackFunctionsApp,
    CallbackTabActionContent,
    DataMainContent,
    DataTabActionContent,
    Native,
    RowForButton,
    RowsSetState,
    ShowButtons,
    StateTabNavigation,
    TabActionContentTableProps,
    TabValueEntries,
    TabValues,
    TriggerObject,
} from '../../app';
import type { SetStateFunction } from 'admin/app';
import type { EventButton } from './event';
import type { AdminConnection, GenericAppProps, GenericAppState } from '@iobroker/adapter-react-v5';

export namespace TelegramMenuApp {
    export interface AdditionalProps extends GenericAppProps {
        themeName: string;
    }
    interface AppProps {
        encryptedFields: string[];
        Connection: AdminConnection;
        translations: Translation;
    }
    export type ExtendedProps = AppProps & AdditionalProps;
    export interface AdditionalState extends GenericAppState {
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
        showPopupMenuList: boolean;
        dropBoxTop: number;
        dropBoxRight: number;
        copyDataObject: { targetCheckboxes: { [key: number]: boolean }; targetActionName: string };
    }
    interface Translation {
        en: Record<string, string>;
        de: Record<string, string>;
        ru: Record<string, string>;
        pt: Record<string, string>;
        nl: Record<string, string>;
        fr: Record<string, string>;
        it: Record<string, string>;
        es: Record<string, string>;
        pl: Record<string, string>;
        uk: Record<string, string>;
        'zh-cn': Record<string, string>;
    }
}

export interface AppContentTabActionContentRowEditorButtonsProps {
    data: DataMainContent &
        TabActionContentTableProps &
        DataTabActionContent & { rows: RowsSetState[]; indexRow: number };
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
    popupRowCard: (obj: EventButton) => void;
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
    callback: { checkAll: (check: boolean) => void };
}

export interface PropsTableNavHeader {
    entries: TabValueEntries[];
}

export interface PropsTableNavHelper {
    state: StateTabNavigation;
    setState: SetStateFunction;
    data: AppData;
    popupHelperCard: (val: EventButton) => void;
}
export interface UpdateProps {
    data: { newRow: ActionNewRowProps; tab: { entries: TabValueEntries[] } };
    callback?: { setStateTabActionContent: SetStateFunction };
}
export interface SaveDataObject {
    checkboxesToCopy: boolean[];
    copyToMenu: string;
    activeMenu: string;
    tab: string;
    rowIndexToEdit: number;
    newTriggerName: string;
}
