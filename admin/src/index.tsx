import React from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { Theme, Utils } from '@iobroker/adapter-react-v5';
import { createRoot } from 'react-dom/client';
import App from './app';

let themeName = Utils.getThemeName();

const root = createRoot(document.getElementById('root')!);

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
    );
}

build();
