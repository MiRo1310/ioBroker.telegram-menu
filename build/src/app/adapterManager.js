"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapter = void 0;
const main_1 = require("../main"); // Importiere den Adapter aus der Hauptdatei
const setup_1 = require("../../test/setup");
if (main_1.adapter) {
    exports.adapter = main_1.adapter; // Verwende den Haupt-Adapter, wenn er definiert ist
}
else {
    exports.adapter = setup_1.adapter; // Verwende den Mock-Adapter, wenn der Haupt-Adapter nicht verfügbar ist
}
//# sourceMappingURL=adapterManager.js.map