import React, { Component } from 'react';
import { I18n } from '@iobroker/adapter-react-v5';
import type { InputProps } from '@/types/app';
import type { EventInput } from '@/types/event';

class Input extends Component<InputProps> {
    onChangeHandler = (event: React.ChangeEvent<HTMLInputElement> | undefined): void => {
        const obj: EventInput = { val: event?.target.value, index: this.props.index, id: this.props?.id || '' };
        this.props.callback(obj);
    };

    render(): React.ReactNode {
        return (
            <label className={`input__container ${this.props.class || ''}`}>
                <input
                    type={this.props.type ? this.props.type : 'text'}
                    className="noneDraggable"
                    placeholder={I18n.t(this.props.placeholder || '')}
                    value={this.props.value}
                    disabled={this.props.disabled}
                    onChange={this.onChangeHandler}
                    spellCheck={this.props.spellCheck ? this.props.spellCheck : false}
                    onMouseOver={
                        this.props.onMouseOver ? e => this.props.onMouseOver?.(e, this.props.setState) : undefined
                    }
                    onMouseLeave={
                        this.props.onMouseLeave ? e => this.props?.onMouseLeave?.(e, this.props.setState) : undefined
                    }
                />
                <span className="input__icon">{this.props.children}</span>
                {this.props.label ? <p>{this.props.label}</p> : null}
            </label>
        );
    }
}

export default Input;
