import React, { Component } from 'react';
import Button from '../Button';
import type { ButtonSmallProps } from '@/types/app';

class BtnSmallUp extends Component<ButtonSmallProps> {
    render(): React.ReactNode {
        return (
            <Button
                b_color="blue"
                color="white"
                title="Move up"
                small="true"
                round="true"
                callback={this.props.callback}
                callbackValue={this.props.index}
                className={`${this.props.disabled} button__small`}
            >
                <i className="material-icons">arrow_upward</i>
            </Button>
        );
    }
}

export default BtnSmallUp;
