import { I18n } from '@iobroker/adapter-react-v5';
import React, { Component } from 'react';
interface AppContentHeaderTelegramUsersErrorMessageProps {
    any?: any;
}

class AppContentHeaderTelegramUsersErrorMessage extends Component {
    constructor(props: AppContentHeaderTelegramUsersErrorMessageProps) {
        super(props);
        this.state = {};
    }

    static render(): React.ReactNode {
        return <span className="telegram__errorMessage">{I18n.t('userSelect')}</span>;
    }
}

export default AppContentHeaderTelegramUsersErrorMessage;
