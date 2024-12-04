import React, { Component } from 'react';
import Button from '../Button';
import type { ButtonSmallProps } from '@/types/app';

class BtnSmallCopy extends Component<ButtonSmallProps> {
    render(): React.ReactNode {
        return (
            <Button
                b_color="blue"
                color="white"
                title="copy"
                small="true"
                round="true"
                index={this.props.index}
                callbackValue={this.props.callbackValue}
                callback={this.props.callback}
                className="button__icon-table"
            >
                <i className="material-icons">content_copy</i>
            </Button>
        );
    }
}

export default BtnSmallCopy;
