import React, { Component } from 'react';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsMainDoubleTriggerInfo } from '@/types/app';

class DoubleTriggerInfo extends Component<PropsMainDoubleTriggerInfo> {
    constructor(props: PropsMainDoubleTriggerInfo) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <div className="error__container-double_trigger">
                <p className="error__header">{I18n.t('doubleTrigger')}</p>
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
