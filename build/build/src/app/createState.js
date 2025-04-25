"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "__esModule", { value: true });
exports.createState = void 0;
const createState = async (_this) => {
    await _this.setObjectNotExistsAsync('communication.requestIds', {
        type: 'state',
        common: {
            name: 'RequestIds',
            type: 'string',
            role: 'state',
            read: true,
            write: false,
            def: '',
        },
        native: {},
    });
};
exports.createState = createState;
