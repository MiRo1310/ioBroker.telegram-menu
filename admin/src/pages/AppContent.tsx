import AppContentHeader from '@/pages/AppContentHeader';
import AppContentTab from '@/pages/AppContentTab';
import AppContentNavigation from '@/pages/AppContentNavigation';
import { TabContext } from '@mui/lab';
import { Box, Grid2 as Grid } from '@mui/material';
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
                size={12}
                className="app__content"
            >
                <Box
                    component="div"
                    sx={{ width: '100%', typography: 'body1' }}
                    className="app__box"
                >
                    <TabContext value={this.props.data.state.tab}>
                        <AppContentNavigation
                            callback={this.props.callback}
                            data={this.props.data}
                        />
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
