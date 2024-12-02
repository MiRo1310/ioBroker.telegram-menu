import React, { Component } from 'react';
import Button from '../Button';
import type { ButtonSmallProps } from '@/types/app';

class BtnSmallUp extends Component<ButtonSmallProps> {
    render(): React.ReactNode {
        return (
            <Button
                b_color="blue"
                color="white"
                title="Search ID"
                small="true"
                round="true"
                verticalAlign="inherit"
                callback={this.props.callback}
                callbackValue={this.props.index}
                className={
                    this.props.disabled ? this.props.disabled : `` + ` ${this.props.class}` ? this.props.class : ''
                }
            >
                <i className="material-icons">search</i>
            </Button>
        );
    }
}

export default BtnSmallUp;
