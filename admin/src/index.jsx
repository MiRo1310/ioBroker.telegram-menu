import React from "react";
import ReactDOM from "react-dom";
import { MuiThemeProvider } from "@material-ui/core/styles";
import theme from "@iobroker/adapter-react-v5/Theme";

import App from "./app";

let themeName = window.localStorage ? window.localStorage.getItem("App.theme") || "light" : "light";
console.log(themeName);
function build() {
	return ReactDOM.render(
		<MuiThemeProvider theme={theme(themeName)}>
			<App
				onThemeChange={(_theme) => {
					themeName = _theme;
					build();
				}}
				themeName={themeName}
			/>
		</MuiThemeProvider>,
		document.getElementById("root"),
	);
}
// function build() {
// 	ReactDOM.render(
// 		<MuiThemeProvider theme={theme(themeName)}>
// 			<App />
// 		</MuiThemeProvider>,
// 		document.getElementById("root"),
// 	);
// }

build();
