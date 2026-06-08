import React, { Component } from 'react';
import { TabContext, TabPanel } from '@mui/lab';
import AppContentTabActionContent from './AppContentTabActionContent';
import { tabValues } from '@/config/entries';
import type { PropsTabAction, StateTabAction } from '@/types/app';

class TabAction extends Component<PropsTabAction, StateTabAction> {
    constructor(props: PropsTabAction) {
        super(props);
        this.state = {
            value: 'set',
        };
    }

    componentDidMount(): void {
        this.setState({ value: this.props.data.state.subTab });
    }

    componentDidUpdate(prevProps: Readonly<PropsTabAction>): void {
        if (prevProps.data.state.subTab !== this.props.data.state.subTab) {
            this.setState({ value: this.props.data.state.subTab });
        }
    }

    render(): React.ReactNode {
        return (
            <TabContext value={this.state.value}>
                {tabValues.map((tab, index) => (
                    <TabPanel
                        key={index}
                        value={tab.value}
                        className="tab__action"
                    >
                        <AppContentTabActionContent
                            callback={this.props.callback}
                            data={{
                                ...this.props.data,
                                tab,
                                card: 'action',
                                showButtons: { add: true, remove: true, edit: true },
                            }}
                        />
                    </TabPanel>
                ))}
            </TabContext>
        );
    }
}

export default TabAction;
