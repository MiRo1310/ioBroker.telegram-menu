import React, { Component } from 'react';
import { Box } from '@mui/material';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsMainTabList, TabListingType } from '@/types/app';
import { tabValues } from '@/config/entries';

class TabListing extends Component<PropsMainTabList> {
    constructor(props: PropsMainTabList) {
        super(props);
        this.state = {};
    }

    handleChange = (val: string): void => {
        if (['nav', 'settings'].includes(val)) {
            this.props.callback.setStateApp({ tab: val });
            return;
        }
        this.props.callback.setStateApp({ tab: 'action', subTab: val });
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
                    <button
                        key={'settings'}
                        className={`icon ${this.isActive('settings') ? 'active' : ''}`}
                        onClick={() => this.handleChange('settings')}
                    >
                        <i className="material-icons">settings</i>
                    </button>
                </div>
            </Box>
        );
    }
}

export default TabListing;
