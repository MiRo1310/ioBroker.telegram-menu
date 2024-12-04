import React, { Component } from 'react';
import Button from '../Button';
import type { ButtonSmallProps } from '@/types/app';

class BtnSmallDown extends Component<ButtonSmallProps> {
    render(): React.ReactNode {
        return (
            <Button
                b_color="blue"
                color="white"
                title="Move down"
                small="true"
                round="true"
                callback={this.props.callback}
                callbackValue={this.props.index}
                className={this.props.disabled + ' button__icon'}

            >
                <i className="material-icons">arrow_downward</i>
            </Button>
        );
    }
}

export default BtnSmallDown;
