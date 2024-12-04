import type { EventButton } from '@/types/event';
import React, { Component } from 'react';
import Button from '@components/Button';

interface ButtonExpandProps {
    isOpen: boolean;
    callback: (val: EventButton) => void;
    label?: string;
    class?: string;

}

class ButtonExpand extends Component<ButtonExpandProps> {
    constructor(props: ButtonExpandProps) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <span className="button__expand">
                <Button
                    className={this.props.label?`button__flex ${this.props.class}` : `button__icon button__primary ${this.props.class}`}
                    id="expandTelegramUsers"
                    callback={this.props.callback}
                    disableButtonStyleByComponent={true}
                >
                    <i className="material-icons">{this.props.isOpen ? 'expand_more' : 'chevron_right'}</i>
                    <span className="button__label">{this .props.label}</span>
                </Button>
            </span>
        );
    }
}

export default ButtonExpand;
