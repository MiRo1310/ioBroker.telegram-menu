import PopupContainer from '@/components/popupCards/PopupContainer';
import AppContentTabNavigationTableRowEditorCard from '@/pages/AppContentTabNavigationTableRowEditorCard';
import React, { Component } from 'react';

import { deepCopy } from '@/lib/Utils.js';
import type { ChangeInputNav } from '@/types/app';
import type { PropsTableNavEditRow } from '@/types/props-types';
import type { EventCheckbox } from '@/types/event';

class TableNavEditRow extends Component<PropsTableNavEditRow> {
    constructor(props: PropsTableNavEditRow) {
        super(props);
        this.state = {};
    }

    changeInput = ({ val, id }: ChangeInputNav): void => {
        const copyNewRow = deepCopy(this.props.state.newRow);
        if (!copyNewRow) {
            return;
        }
        if (id) {
            copyNewRow[id] = val.trim().toString();
        }
        this.props.setState({ newRow: copyNewRow });
    };
    changeCheckbox = ({ isChecked, id }: EventCheckbox): void => {
        const copyNewRow = deepCopy(this.props.state.newRow);
        if (!copyNewRow) {
            return;
        }
        if (id) {
            copyNewRow[id] = isChecked.toString();
        }
        this.props.setState({ newRow: copyNewRow });
    };

    openHelperText = (value: string): void => {
        if (value) {
            this.props.setState({ editedValueFromHelperText: this.props.state.newRow[value] });
            this.props.setState({ helperTextFor: value });
        }

        this.props.setState({ helperText: true });
    };

    render(): React.ReactNode {
        return (
            <PopupContainer
                callback={this.props.popupRowCard}
                call={this.props.state.call}
                nav={this.props.state.nav}
                text={this.props.state.text}
                usedTrigger={this.props.data.state.usedTrigger}
                width="99%"
                height="450px"
                title="Navigation"
                setState={this.props.setState.bind(this)}
                isOK={this.props.state.valuesAreOk}
            >
                <AppContentTabNavigationTableRowEditorCard
                    callback={{ onChangeInput: this.changeInput, onChangeCheckbox: this.changeCheckbox }}
                    inUse={this.props.state.callInUse}
                    openHelperText={this.openHelperText}
                    entries={this.props.data.entries}
                    newRow={this.props.state.newRow}
                    data={this.props.data}
                />
            </PopupContainer>
        );
    }
}

export default TableNavEditRow;
