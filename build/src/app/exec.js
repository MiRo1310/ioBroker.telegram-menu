"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWithCurl = loadWithCurl;
const logging_1 = require("./logging");
const child_process_1 = require("child_process");
function loadWithCurl(adapter, token, path, url, callback) {
    (0, child_process_1.exec)(`curl -H "Authorization: Bearer ${token.trim()}" "${url}" > ${path}`, (error, stdout, stderr) => {
        if (stdout) {
            adapter.log.debug(`Stdout : "${stdout}"`);
        }
        if (stderr) {
            adapter.log.debug(`Stderr : "${stderr}"`);
        }
        if (error) {
            (0, logging_1.errorLogger)('Error in exec:', error, adapter);
            return;
        }
        if (!callback) {
            return;
        }
        adapter.log.debug('Curl command executed successfully');
        callback();
    });
}
//# sourceMappingURL=exec.js.map