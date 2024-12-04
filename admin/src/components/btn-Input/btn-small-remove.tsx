import React, { Component } from 'react';
import Button from '../Button';
import type { ButtonSmallProps } from '@/types/app';

class BtnSmallRemove extends Component<ButtonSmallProps> {
    render(): React.ReactNode {
        return (
            <Button
                b_color="red"
                color="white"
                title="Delete"
                small="true"
                round="true"
                callback={this.props.callback}
                callbackValue={this.props.index}
                className={`${this.props.disabled} button__icon-table`}
                disabled={this.props.disabled}
            >
                <i className="material-icons">delete</i>
            </Button>
        );
    }
}

export default BtnSmallRemove;
