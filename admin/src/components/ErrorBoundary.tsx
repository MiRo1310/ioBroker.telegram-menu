import { Component, ErrorInfo } from "react";

interface State {
	hasError: boolean;
}

class ErrorBoundary extends Component<any, State> {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error) {
		// Aktualisieren Sie den Zustand, sodass der nächste Render einen Fallback-UI zeigt
		console.error("ErrorBoundary getDerivedStateFromError:", error);
		return { hasError: true };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		// Fehlerprotokollierung
		console.error("Error caught by ErrorBoundary:", error, errorInfo);
	}

	render() {
		// if (this.state.hasError) {
		// 	// Fallback-UI anzeigen
		// 	return <h1>Etwas ist schief gelaufen.</h1>;
		// }

		return this.props.children;
	}
}

export default ErrorBoundary;
