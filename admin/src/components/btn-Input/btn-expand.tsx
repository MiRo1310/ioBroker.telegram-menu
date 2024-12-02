import type { EventButton } from '@/types/event';
import React, { Component } from 'react';
import Button from '@components/Button';

interface ButtonExpandProps {
    isOpen: boolean;
    callback: (val: EventButton) => void;
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
                    className="button__icon button__primary"
                    id="expandTelegramUsers"
                    callback={this.props.callback}
                    disableButtonStyleByComponent={true}
                >
                    <i className="material-icons">{this.props.isOpen ? 'expand_more' : 'chevron_right'}</i>
                </Button>
            </span>
        );
    }
}

export default ButtonExpand;
