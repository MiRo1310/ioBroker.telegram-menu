"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLogger = void 0;
const errorLogger = (title, e, adapter) => {
    if (adapter.supportsFeature && adapter.supportsFeature('PLUGINS')) {
        const sentryInstance = adapter.getPluginInstance('sentry');
        if (sentryInstance) {
            sentryInstance.getSentryObject()?.captureException(e);
        }
    }
    adapter.log.error(title);
    adapter.log.error(`Error message: ${e.message}`);
    adapter.log.error(`Error stack: ${e.stack}`);
    if (e?.response) {
        adapter.log.error(`Server response: ${e?.response?.status}`);
    }
    if (e?.response) {
        adapter.log.error(`Server status: ${e?.response?.statusText}`);
    }
};
exports.errorLogger = errorLogger;
//# sourceMappingURL=logging.js.map