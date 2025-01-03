import React, {Component} from 'react';
import {TabContext, TabPanel} from '@mui/lab';
import AppContentTabActionContent from './AppContentTabActionContent';
import {tabValues} from '@/config/entries';
import AppContentTabActionTabsListing from './AppContentTabActionTabsListing';
import type {PropsTabAction, StateTabAction} from '@/types/app';

class TabAction extends Component<PropsTabAction, StateTabAction> {
    constructor(props: PropsTabAction) {
        super(props);
        this.state = {
            value: 'set',
        };
    }


    componentDidMount() {
        this.setState({value: this.props.data.state.subTab});
    }

    render(): React.ReactNode {
        return (
            <TabContext value={this.state.value}>
                <AppContentTabActionTabsListing
                    callback={this.props.callback}
                    setState={this.setState.bind(this)}
                />
                {tabValues.map((tab, index) => (
                    <TabPanel
                        key={index}
                        value={tab.value}
                        className="TabPanel-Action"
                    >
                        <AppContentTabActionContent
                            callback={this.props.callback}
                            data={{
                                ...this.props.data,
                                tab,
                                card: 'action',
                                showButtons: {add: true, remove: true, edit: true},
                            }}
                        />
                    </TabPanel>
                ))}
            </TabContext>
        );
    }
}

export default TabAction;
