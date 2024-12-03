import React, { Component } from 'react';
import { Tab, Box } from '@mui/material';
import { TabList } from '@mui/lab';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsMainTabList, TabListingType } from '@/types/app';

class TabListing extends Component<PropsMainTabList> {
    constructor(props: PropsMainTabList) {
        super(props);
        this.state = {};
    }
    handleChange = (event: React.SyntheticEvent, val: string): void => {
        this.props.callback.setStateApp({ tab: val });
    };

    tabs: TabListingType[] = [
        {
            label: 'navigation',
            value: 'nav',
        },
        {
            label: 'action',
            value: 'action',
        },
        {
            label: 'settings',
            value: 'settings',
        },
    ];
    render(): React.ReactNode {
        return (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList
                    onChange={this.handleChange}
                    aria-label="lab API tabs example"
                    className="App-TabList"
                >
                    Test
                    {this.tabs.map(tab => (
                        <Tab
                            label={I18n.t(tab.label)}
                            value={tab.value}
                            key={tab.label}
                        />
                    ))}
                </TabList>
            </Box>
        );
    }
}

export default TabListing;
