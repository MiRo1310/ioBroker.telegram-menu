import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@iobroker/adapter-react-v5/Theme";
import { Utils } from "@iobroker/adapter-react-v5";

import App from "./app";

let themeName = Utils.getThemeName();
console.log(themeName);
function build() {
	return ReactDOM.render(
		<ThemeProvider theme={theme(themeName)}>
			<App
				onThemeChange={(_theme) => {
					themeName = _theme;
					build();
				}}
				//@ts-ignore
				themeName={themeName}
			/>
		</ThemeProvider>,
		document.getElementById("root"),
	);
}
build();
