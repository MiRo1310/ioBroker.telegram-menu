import React, { Component } from 'react';
import PopupContainer from '@components/popupCards/PopupContainer';
import { I18n } from '@iobroker/adapter-react-v5';

class AppContentTabNavigationTableBodyValueModifierPopup extends Component<{ callback: () => void }> {
    render(): React.ReactNode {
        return (
            <PopupContainer
                onlyCloseBtn={true}
                title={I18n.t('info')}
                height={'20%'}
                callback={this.props.callback}
            >
                <p className={'flex justify-center text-lg'}>{I18n.t('menuCannotBeFound')}</p>
                <p className={'text-center'}>{I18n.t('contactDeveloperForExistingMenu')}</p>
            </PopupContainer>
        );
    }
}

export default AppContentTabNavigationTableBodyValueModifierPopup;
