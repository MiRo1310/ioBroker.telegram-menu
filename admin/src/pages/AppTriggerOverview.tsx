import React, { Component } from 'react';
import PopupContainer from '@/components/popupCards/PopupContainer';
import TriggerOverview from '@/pages/AppTriggerOverviewContent';
import type { PropsMainTriggerOverview } from '@/types/app';
import type { EventButton } from '@/types/event';

class MainTriggerOverview extends Component<PropsMainTriggerOverview> {
    constructor(props: PropsMainTriggerOverview) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <PopupContainer
                title="Trigger Info"
                width="99%"
                height="99%"
                top="60%"
                class="TriggerOverview-PopupContainer"
                closeBtn={true}
                callback={({ value }: EventButton) => this.props.callback.setState({ showTriggerInfo: value })}
            >
                <TriggerOverview
                    usersInGroup={this.props.state.native.usersInGroup}
                    userActiveCheckbox={this.props.state.native.userActiveCheckbox}
                    data={this.props.state.native.data}
                />
            </PopupContainer>
        );
    }
}

export default MainTriggerOverview;
