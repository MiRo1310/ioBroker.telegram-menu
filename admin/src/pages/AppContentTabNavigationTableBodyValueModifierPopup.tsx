import React, { Component } from 'react';
import PopupContainer from '@components/popupCards/PopupContainer';
import { I18n } from '@iobroker/adapter-react-v5';
import type { DataMainContent, TabValueEntries } from '@/types/app';

interface State {
    description: string | null;
}

interface Props {
    callback: () => void;
    data: DataMainContent & { entries: TabValueEntries[] };
    clickedTrigger: string | null;
}

class AppContentTabNavigationTableBodyValueModifierPopup extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            description: null,
        };
    }

    componentDidMount(): void {
        console.log('mount');
        console.log(this.getDescription());
        this.setState({ description: this.getDescription() });
    }

    componentDidUpdate(
        prevProps: Readonly<{
            callback: () => void;
            data: DataMainContent & { entries: TabValueEntries[] };
            clickedTrigger: string | null;
        }>,
    ): void {
        if (prevProps.clickedTrigger !== this.props.clickedTrigger) {
            this.setState({ description: this.getDescription() });
        }
    }

    getDescription = (): string | null => {
        const clickedTrigger = this.props.clickedTrigger;

        if (!clickedTrigger) {
            return null;
        }

        return this.props.data.state.native.description.find(element => element.call === clickedTrigger)?.description;
    };

    render(): React.ReactNode {
        return (
            <PopupContainer
                onlyCloseBtn={true}
                title={I18n.t('info')}
                height={'30%'}
                width={'600px'}
                callback={this.props.callback}
            >
                <p className={'flex justify-center text-lg'}>{I18n.t('menuCannotBeFound')}</p>
                {this.state.description ? (
                    <>
                        <p className={'popup__description_header'}>{I18n.t('description')}</p>
                        <div className={'popup__description'}>{this.state.description}</div>
                    </>
                ) : (
                    <p className={'text-center'}>{I18n.t('contactDeveloperForExistingMenu')}</p>
                )}
            </PopupContainer>
        );
    }
}

export default AppContentTabNavigationTableBodyValueModifierPopup;
