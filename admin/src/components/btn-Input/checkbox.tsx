import { I18n } from '@iobroker/adapter-react-v5';
import React, { Component } from 'react';
import type { PropsCheckbox } from '@/types/app';

class Checkbox extends Component<PropsCheckbox> {
    onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.callback({
            isChecked: event.target.checked,
            id: this.props?.id,
            index: this.props?.index,
            params: this.props?.params,
        });
    };

    render(): React.ReactNode {
        return (
            <label className="checkbox">
                <input
                    type="checkbox"
                    checked={this.props.isChecked}
                    onChange={this.onChangeHandler}
                    title={this.props.title ? I18n.t(this.props.title) : ''}
                    className={this.props.class}
                />
                {this.props.label ? <span>{this.props.label}</span> : null}
            </label>
        );
    }
}

export default Checkbox;
