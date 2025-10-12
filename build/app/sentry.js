"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToSentry = void 0;
const sendToSentry = (error, adapter) => {
    if (adapter.supportsFeature && adapter.supportsFeature('PLUGINS')) {
        const sentryInstance = adapter.getPluginInstance('sentry');
        if (sentryInstance) {
            const Sentry = sentryInstance.getSentryObject();
            Sentry?.withScope((scope) => {
                scope.setLevel('info');
                scope.setExtra('key', 'value');
                Sentry.captureMessage('Event name', 'info'); // Level "info"
            });
        }
    }
};
exports.sendToSentry = sendToSentry;
//# sourceMappingURL=sentry.js.map