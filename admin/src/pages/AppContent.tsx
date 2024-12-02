import AppContentHeader from '@/pages/AppContentHeader';
import AppContentTab from '@/pages/AppContentTab';
import AppContentTabsListing from '@/pages/AppContentTabsListing';
import { TabContext } from '@mui/lab';
import { Box, Grid } from '@mui/material';
import type { PropsMainContent } from '@/types/app';
import React, { Component } from 'react';

class AppContent extends Component<PropsMainContent> {
    constructor(props: PropsMainContent) {
        super(props);
        this.state = {};
    }

    render(): React.ReactNode {
        return (
            <Grid
                item
                xs={12}
                className="app__content"
            >
                <Box
                    component="div"
                    sx={{ width: '100%', typography: 'body1' }}
                    className="app__box"
                >
                    <TabContext value={this.props.data.state.tab}>
                        <AppContentTabsListing callback={this.props.callback} />
                        <AppContentHeader
                            data={this.props.data}
                            callback={this.props.callback}
                        />
                        <AppContentTab
                            callback={this.props.callback}
                            data={this.props.data}
                        />
                    </TabContext>
                </Box>
            </Grid>
        );
    }
}

export default AppContent;
