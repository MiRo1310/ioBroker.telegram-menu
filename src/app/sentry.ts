import type TelegramMenu from '../main';

export const sendToSentry = (error: Error, adapter: TelegramMenu): void => {
    if (adapter.supportsFeature && adapter.supportsFeature('PLUGINS')) {
        const sentryInstance = adapter.getPluginInstance('sentry');
        if (sentryInstance) {
            const Sentry = sentryInstance.getSentryObject();

            Sentry?.withScope(
                (scope: {
                    setLevel: (arg0: 'info' | 'debug' | 'error') => void;
                    setExtra: (arg0: string, arg1: string) => void;
                }) => {
                    scope.setLevel('info');
                    scope.setExtra('key', 'value');
                    Sentry.captureMessage('Event name', 'info'); // Level "info"
                },
            );
        }
    }
};
