import React, { Component } from 'react';
import { Box } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsMainTabList, TabListingType } from '@/types/app';
import { tabValues } from '@/config/entries';

class AppContentNavigation extends Component<PropsMainTabList> {
    constructor(props: PropsMainTabList) {
        super(props);
        this.state = {};
    }

    handleChange = (val: string): void => {
        if (['nav', 'settings', 'description'].includes(val)) {
            this.props.callback.setStateApp({ tab: val, clickedTriggerInNav: null });
            return;
        }
        this.props.callback.setStateApp({ tab: 'action', subTab: val, clickedTriggerInNav: null });
    };

    tabs: TabListingType[] = [
        {
            label: 'navigation',
            value: 'nav',
        },
    ];
    getTabs = (): TabListingType[] => {
        tabValues.map(tab => {
            if (this.tabs.find(t => t.value === tab.value)) {
                return;
            }
            this.tabs.push({ label: tab.label, value: tab.value });
        });

        return this.tabs;
    };

    isActive = (val: string): boolean => {
        return (
            this.props.data.state.tab === val ||
            (this.props.data.state.subTab === val && this.props.data.state.tab === 'action')
        );
    };

    render(): React.ReactNode {
        return (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <div className={'flex justify-between App-TabList'}>
                    <div className={'flex flex-wrap'}>
                        {this.getTabs().map(tab => (
                            <button
                                key={tab.label}
                                className={`${this.isActive(tab.value) ? 'active' : ''}`}
                                onClick={() => this.handleChange(tab.value)}
                            >
                                {I18n.t(tab.label)}
                            </button>
                        ))}
                    </div>
                    <div className={'flex items-center '}>
                        <button
                            key={'description'}
                            className={`${this.isActive('description') ? 'active' : ''}`}
                            onClick={() => this.handleChange('description')}
                        >
                            {I18n.t('descriptions')}
                        </button>
                        <button
                            key={'settings'}
                            className={`icon ${this.isActive('settings') ? 'active' : ''}`}
                            onClick={() => this.handleChange('settings')}
                        >
                            <i className="material-icons">settings</i>
                        </button>
                    </div>
                </div>
            </Box>
        );
    }
}

export default AppContentNavigation;
