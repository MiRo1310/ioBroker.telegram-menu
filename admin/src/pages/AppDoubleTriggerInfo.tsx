import React, { Component } from 'react';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsMainDoubleTriggerInfo } from 'admin/app';

class DoubleTriggerInfo extends Component<PropsMainDoubleTriggerInfo> {
    constructor(props: PropsMainDoubleTriggerInfo) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <div className="ErrorDoubleTrigger-Container">
                <p className="Error-Header">{I18n.t('doubleTrigger')}</p>
                {this.props.state.doubleTrigger.map((element, index) => (
                    <p
                        className="Error-Items"
                        key={index}
                    >
                        {element}
                    </p>
                ))}
            </div>
        );
    }
}

export default DoubleTriggerInfo;
