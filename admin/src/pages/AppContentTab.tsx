import { navEntries } from '@/config/entries';
import TabAction from '@/pages/action/AppContentTabAction';
import TabNavigation from '@/pages/navigation/AppContentTabNavigation';
import SettingsTab from '@/pages/settings/AppContentTabSettings';
import { TabPanel } from '@mui/lab';
import React, { Component } from 'react';
import type { PropsMainTabs } from '@/types/props-types';
import AppContentTabDescription from '@/pages/settings/AppContentTabDescription';

class Tabs extends Component<PropsMainTabs> {
    constructor(props: PropsMainTabs) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <>
                <TabPanel value="nav">
                    <TabNavigation
                        data={{ ...this.props.data, entries: navEntries }}
                        callback={this.props.callback}
                    />
                </TabPanel>
                <TabPanel
                    value="action"
                    className="tabAction"
                >
                    <TabAction
                        data={this.props.data}
                        callback={this.props.callback}
                    />
                </TabPanel>
                <TabPanel
                    value="description"
                    className="tabAction"
                >
                    <AppContentTabDescription
                        data={this.props.data}
                        callback={this.props.callback}
                    />
                </TabPanel>
                <TabPanel value="settings">
                    <SettingsTab
                        data={this.props.data}
                        callback={this.props.callback}
                    />
                </TabPanel>
            </>
        );
    }
}

export default Tabs;
