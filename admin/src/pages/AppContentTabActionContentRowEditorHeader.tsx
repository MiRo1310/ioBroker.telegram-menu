import {updateTrigger} from '@/lib/actionUtils.js';
import {isChecked} from '@/lib/Utils.js';
import type {EventButton, EventCheckbox, EventSelect} from '@/types/event';
import Button from '@components/Button';
import Checkbox from '@components/btn-Input/checkbox';
import Select from '@components/btn-Input/select';
import React, {Component} from 'react';
import type {
    CallbackFunctionsApp,
    CallbackTabActionContent,
    DataMainContent,
    DataTabActionContent,
    TabActionContentTableProps,
} from '@/types/app';
import {I18n} from '@iobroker/adapter-react-v5';

export interface AppContentTabActionContentRowEditorInputAboveTableProps {
    data: DataMainContent & TabActionContentTableProps & DataTabActionContent & { isMinOneCheckboxChecked: boolean };

    callback: CallbackFunctionsApp &
        CallbackTabActionContent & { openHelperText: (value: any) => void } & {
        updateData: (obj: EventCheckbox) => void;
        openCopyModal: (obj: EventButton) => void;
    };
}

class AppContentTabActionContentRowEditorInputAboveTable extends Component<AppContentTabActionContentRowEditorInputAboveTableProps> {
    constructor(props: AppContentTabActionContentRowEditorInputAboveTableProps) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        const {newRow, newUnUsedTrigger} = this.props.data;
        return (
            <div className="editor__header">
                <Button
                    callbackValue={true}
                    callback={this.props.callback.openCopyModal}
                    className={`${!this.props.data.isMinOneCheckboxChecked ? 'button__disabled' : 'button--hover'} button button__copy button__icon_text`}
                    disabled={!this.props.data.isMinOneCheckboxChecked}
                >
                    <i className="material-icons translate">content_copy</i>
                    {I18n.t('copy')}
                </Button>
                {newRow.trigger ? (
                    <div className="editor__header_trigger">
                        <Select
                            width="10%"
                            selected={newRow.trigger[0]}
                            options={newUnUsedTrigger}
                            id="trigger"
                            callback={({val}: EventSelect) =>
                                updateTrigger({trigger: val}, this.props, this.setState.bind(this))
                            }
                            callbackValue="event.target.value"
                            label="Trigger"
                            placeholder="Select a Trigger"
                        />
                    </div>
                ) : null}
                {newRow.parse_mode ? (
                    <div className="editor__header_parseMode">
                        <Checkbox
                            id="parse_mode"
                            index={0}
                            callback={this.props.callback.updateData}
                            isChecked={isChecked(newRow.parse_mode[0])}
                            obj={true}
                            label="Parse Mode"
                        />
                    </div>
                ) : null}
            </div>
        );
    }
}

export default AppContentTabActionContentRowEditorInputAboveTable;
