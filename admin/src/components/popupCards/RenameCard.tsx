import React, { Component } from 'react';
import Input from '../btn-Input/input';
import type { PropsRenameCard, StateRenameCard } from '@/types/app';
import type { EventInput } from '@/types/event';

class RenameCard extends Component<PropsRenameCard, StateRenameCard> {
    constructor(props: PropsRenameCard) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <div className="rename__card">
                <Input
                    value={this.props.value as string}
                    id={this.props.id}
                    callback={({ val }: EventInput) => this.props.callback.setState({ [this.props.id]: val })}
                />
            </div>
        );
    }
}

export default RenameCard;
