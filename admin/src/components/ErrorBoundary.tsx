import type { ErrorInfo } from 'react';
/* eslint-disable  no-duplicate-imports */
import { Component } from 'react';

interface State {
    hasError: boolean;
}

type ErrorBoundaryProps = any;

class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): { hasError: boolean } {
        // Aktualisieren Sie den Zustand, sodass der nächste Render einen Fallback-UI zeigt
        console.error('ErrorBoundary getDerivedStateFromError:', error);
        return { hasError: true };
    }

    static componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Fehlerprotokollierung
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render(): React.ReactNode {
        // if (this.state.hasError) {
        // 	// Fallback-UI anzeigen
        // 	return <h1>Etwas ist schief gelaufen.</h1>;
        // }

        return this.props.children;
    }
}

export default ErrorBoundary;
