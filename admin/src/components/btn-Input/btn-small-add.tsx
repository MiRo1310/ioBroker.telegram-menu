import React, { Component } from 'react';
import Button from '../Button';
import type { ButtonSmallProps } from '@/types/app';

class BtnSmallAdd extends Component<ButtonSmallProps> {
    render(): React.ReactNode {
        return (
            <Button
                b_color="#ddd"
                title="Add"
                small="true"
                round="true"
                index={this.props.index}
                callbackValue={this.props.callbackValue}
                callback={this.props.callback}
                className="button__icon-table"
            >
                <i className="material-icons">add</i>
            </Button>
        );
    }
}

export default BtnSmallAdd;
