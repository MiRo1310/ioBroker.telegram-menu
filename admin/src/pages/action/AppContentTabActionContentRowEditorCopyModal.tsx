import Select from '@components/btn-Input/select';
import type {
    CallbackFunctionsApp,
    CallbackTabActionContent,
    DataMainContent,
    DataTabActionContent,
    Echart,
    EventAction,
    GetAction,
    HttpRequest,
    Pic,
    SetAction,
    TabActionContentTableProps,
} from '@/types/app';
import React, { Component } from 'react';
import AppContentTabActionContentRowEditorCopyModalSelectedValues from './AppContentTabActionContentRowEditorCopyModalSelectedValues';
import { I18n } from '@iobroker/adapter-react-v5';
import type { EventSelect } from '@/types/event';

export interface PropsRowEditorCopyModal {
    data: DataMainContent & TabActionContentTableProps & DataTabActionContent;
    callback: CallbackFunctionsApp &
        CallbackTabActionContent & {
            openHelperText: (value: any) => void;
            setStateRowEditor: (value: any) => void;
            setFunctionSave: (ref: AppContentTabActionContentRowEditorCopyModalSelectedValues) => void;
        };
    checkboxes: boolean[];
}
interface State {
    selectedMenu: string;
    action: string;
}

class AppContentTabActionContentRowEditorCopyModal extends Component<PropsRowEditorCopyModal, State> {
    constructor(props: PropsRowEditorCopyModal) {
        super(props);
        this.state = {
            selectedMenu: '',
            action: '',
        };
    }

    componentDidMount(): void {
        this.setState({ action: this.props.data.tab.value });
    }

    getAllMenusWithoutActiveMenu(): string[] {
        return Object.keys(this.props.data.state.native.usersInGroup);
    }

    getValuesInSelectedAction(): GetAction[] | SetAction[] | Pic[] | HttpRequest[] | Echart[] | EventAction[] {
        return this.props.data.state.native.data.action?.[this.state.selectedMenu]?.[this.state.action] || [];
    }

    updateSelect = ({ val }: EventSelect): void => {
        this.setState({ selectedMenu: val });
        this.props.callback.setStateRowEditor({ copyToMenu: val });
        this.props.callback.setStateApp({ copyDataObject: { targetActionName: val } });
    };

    render(): React.ReactNode {
        return (
            <div className="editor__modal_container">
                <div className="editor__modal_inputs">
                    {I18n.t('activeMenu')}: {this.props.data.state.activeMenu}
                    <p>{I18n.t('menuToCopy')}</p>
                    <Select
                        options={this.getAllMenusWithoutActiveMenu()}
                        id="selectedMenu"
                        selected={this.state.selectedMenu || ''}
                        placeholder="Select a menu"
                        callback={this.updateSelect}
                    />
                </div>
                {this.state.action !== '' ? (
                    <AppContentTabActionContentRowEditorCopyModalSelectedValues
                        value={this.getValuesInSelectedAction()}
                        data={this.props.data.state.native.data}
                        callback={{
                            ...this.props.callback,
                            setStateRowEditor: this.props.callback.setStateRowEditor,
                            setFunctionSave: this.props.callback.setFunctionSave,
                        }}
                    />
                ) : null}
            </div>
        );
    }
}

export default AppContentTabActionContentRowEditorCopyModal;
