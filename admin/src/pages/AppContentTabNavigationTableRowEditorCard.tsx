import React, { Component } from 'react';
import Input from '@/components/btn-Input/input';
import { BtnCircleAdd } from '@components/btn-Input/btn-circle-add';
import { I18n } from '@iobroker/adapter-react-v5';
import Checkbox from '@/components/btn-Input/checkbox';
import { isChecked } from '@/lib/Utils';
import type { PropsRowNavCard } from '@/types/app';
import AppContentTabNavigationTableRowEditorCardTriggerSelection from '@/pages/AppContentTabNavigationTableRowEditorCardTriggerSelection';

class AppContentTabNavigationTableRowEditorCard extends Component<PropsRowNavCard> {
    constructor(props: PropsRowNavCard) {
        super(props);
        this.state = {};
    }

    addSelectedToNewRow = (e: string): void => {
        this.props.callback.onChangeInput({ val: `${this.props.newRow.value} , ${e}`, id: 'value' });
    };

    render(): React.ReactNode {
        return (
            <div className="edit__container">
                {this.props.entries.map((entry, i) =>
                    !(entry.name == 'value') && !(entry.name == 'text') && !entry.checkbox ? (
                        <Input
                            key={i}
                            value={this.props.newRow[entry.name]}
                            id={entry.name}
                            callback={this.props.callback.onChangeInput}
                            callbackValue="event.target.value"
                            label={I18n.t(entry.headline)}
                            class={this.props.inUse ? 'inUse' : ''}
                        />
                    ) : entry.name == 'value' || entry.name == 'text' ? (
                        <Input
                            key={i}
                            value={this.props.newRow[entry.name]}
                            id={entry.name}
                            callback={this.props.callback.onChangeInput}
                            callbackValue="event.target.value"
                            label={I18n.t(entry.headline)}
                        >
                            <BtnCircleAdd callback={() => this.props.openHelperText(entry.name)} />
                            {entry.name == 'value' ? (
                                <AppContentTabNavigationTableRowEditorCardTriggerSelection
                                    data={this.props.data}
                                    callback={this.addSelectedToNewRow}
                                />
                            ) : null}
                        </Input>
                    ) : (
                        <Checkbox
                            key={i}
                            id={entry.name}
                            index={i}
                            class="checkbox__line"
                            callback={this.props.callback.onChangeCheckbox}
                            isChecked={isChecked(this.props.newRow[entry.name])}
                            obj={true}
                            label={I18n.t(entry.headline)}
                        />
                    ),
                )}
            </div>
        );
    }
}

export default AppContentTabNavigationTableRowEditorCard;
