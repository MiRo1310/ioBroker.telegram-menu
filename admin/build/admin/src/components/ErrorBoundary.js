"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        console.error('ErrorBoundary getDerivedStateFromError:', error);
        return { hasError: true };
    }
    static componentDidCatch(error, errorInfo) {
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }
    render() {
        return this.props.children;
    }
}
exports.default = ErrorBoundary;
//# sourceMappingURL=ErrorBoundary.js.map