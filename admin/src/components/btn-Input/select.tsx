import React, { Component } from 'react';
import { I18n } from '@iobroker/adapter-react-v5';
import type { SelectProps } from '@/types/app';

class Select extends Component<SelectProps> {
    onChangeHandler = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        if (!event) {
            return;
        }
        this.props.callback({ id: this.props.id, val: event.target.value });
    };

    render(): React.ReactNode {
        return (
            <label className="Select">
                {this.props.label ? <span className="select__label">{I18n.t(this.props.label || '')}</span> : null}
                <select
                    name={this.props.name}
                    value={this.props.selected}
                    onChange={this.onChangeHandler}
                >
                    <option
                        value=""
                        disabled
                    >
                        {I18n.t(this.props.placeholder || '')}
                    </option>

                    {this.props.options.map((option, index) => {
                        return (
                            <option
                                key={index}
                                value={option}
                            >
                                {option}
                            </option>
                        );
                    })}
                </select>
            </label>
        );
    }
}

export default Select;
