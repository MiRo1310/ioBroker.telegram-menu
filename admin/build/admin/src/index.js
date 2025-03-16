"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const styles_1 = require("@mui/material/styles");
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const app_1 = __importDefault(require("./app"));
let themeName = adapter_react_v5_1.Utils.getThemeName();
function build() {
    react_dom_1.default.render(react_1.default.createElement(styles_1.ThemeProvider, { theme: (0, adapter_react_v5_1.Theme)(themeName) },
        react_1.default.createElement(app_1.default, { onThemeChange: _theme => {
                themeName = _theme;
                build();
            }, themeName: themeName })), document.getElementById('root'));
}
build();
//# sourceMappingURL=index.js.map