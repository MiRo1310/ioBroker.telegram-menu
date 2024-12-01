import React, { Component } from 'react';
import Button from './button';
import type { ButtonSmallProps } from '@/app';

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
                className={this.props.disabled}
                disabled={this.props.disabled}
            >
                <i className="material-icons">delete</i>
            </Button>
        );
    }
}

export default BtnSmallRemove;
