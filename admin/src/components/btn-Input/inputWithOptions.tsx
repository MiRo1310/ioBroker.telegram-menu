import React, { Component, type ReactNode } from 'react';
import { I18n } from '@iobroker/adapter-react-v5';
import type { SetStateFunction } from '@/types/app';
import type { EventInput } from '@/types/event';

interface Props {
    id?: string;
    type?: string;
    placeholder?: string;
    value: string;
    callback: SetStateFunction;
    label?: string;
    spellCheck?: boolean;
    class?: string;
    children?: ReactNode;
    index?: number;
    disabled?: boolean;
    setState?: SetStateFunction;
    onMouseOver?: (e: React.MouseEvent<HTMLInputElement>, setState: SetStateFunction | undefined) => void;
    onMouseLeave?: (e: React.MouseEvent<HTMLInputElement>, setState: SetStateFunction | undefined) => void;
    className?: string;
    options?: string[];
}

class InputWithOptions extends Component<Props> {
    onChangeHandler = (event: React.ChangeEvent<HTMLInputElement> | undefined): void => {
        const obj: EventInput = { val: event?.target.value, index: this.props.index, id: this.props?.id || '' };
        this.props.callback(obj);
    };

    render(): React.ReactNode {
        return (
            <label className={`input__container ${this.props.class || ''}`}>
                <input
                    type={this.props.type ? this.props.type : 'text'}
                    className="InputField noneDraggable"
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
                    list={'options'}
                />
                {this.props.options ? (
                    <datalist id="options">
                        {this.props.options?.map((option, index) => (
                            <option
                                value={option}
                                key={index}
                            />
                        ))}
                    </datalist>
                ) : null}
                <span className="input__icon">{this.props.children}</span>
                <p>{this.props.label}</p>
            </label>
        );
    }
}

export default InputWithOptions;
