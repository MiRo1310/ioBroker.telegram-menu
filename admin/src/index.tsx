import React from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@iobroker/adapter-react-v5/Theme';
import { Utils } from '@iobroker/adapter-react-v5';

import App from './app';

let themeName = Utils.getThemeName();

function build(): void {
    ReactDOM.render(
        <ThemeProvider theme={theme(themeName)}>
            <App
                onThemeChange={_theme => {
                    themeName = _theme;
                    build();
                }}
                themeName={themeName}
            />
        </ThemeProvider>,
        document.getElementById('root'),
    );
}
build();
