"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_react_v5_1 = require("@iobroker/adapter-react-v5");
const react_1 = __importStar(require("react"));
class Square extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = {
            bColor: '',
            width: 6,
            color: 'black',
            text: '',
            left: '20px',
            fontWeight: 'normal',
        };
    }
    getValuesForSquare() {
        switch (this.props.color) {
            case 'white':
                if (this.props.trigger == '-') {
                    this.setState({ bColor: 'transparent' });
                    break;
                }
                this.setState({ bColor: 'white', width: 60, text: 'Not linked', left: '-59px', fontWeight: 'bold' });
                break;
            case 'black':
                this.setState({
                    bColor: 'black',
                    width: this.props.noText ? 6 : 60,
                    color: 'white',
                    text: this.props.noText ? '' : 'Unused',
                    left: this.props.noText ? '-5px' : '-59px',
                    fontWeight: 'bold',
                });
                break;
            default:
                if (this.props.trigger != '-') {
                    this.setState({ bColor: this.props.color, left: `${-(this.props.position * 10 + 5)}px` });
                }
                else {
                    this.setState({ bColor: 'transparent' });
                }
                break;
        }
    }
    componentDidMount() {
        this.getValuesForSquare();
    }
    componentDidUpdate(prevProps) {
        if (this.props.color !== prevProps.color ||
            this.props.trigger !== prevProps.trigger ||
            this.props.position !== prevProps.position) {
            this.getValuesForSquare();
        }
    }
    render() {
        return (react_1.default.createElement("div", null,
            react_1.default.createElement("div", { className: "squareText", style: {
                    width: `${this.state.width}px`,
                    height: '10px',
                    backgroundColor: this.state.bColor,
                    color: this.state.color,
                    marginRight: '5px',
                    position: 'absolute',
                    left: this.state.left,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: this.state.fontWeight,
                } }, adapter_react_v5_1.I18n.t(this.state.text))));
    }
}
exports.default = Square;
//# sourceMappingURL=AppTriggerOverviewContentSquare.js.map