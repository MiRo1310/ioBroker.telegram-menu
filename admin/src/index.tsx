import React from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { Theme, Utils } from '@iobroker/adapter-react-v5';
import { createRoot } from 'react-dom/client';
import App from './app';

let themeName = Utils.getThemeName();
const container = document.getElementById('app');
const root = createRoot(container); // createRoot(container!) if you use TypeScript

function build(): void {
    root.render(
        <ThemeProvider theme={Theme(themeName)}>
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
