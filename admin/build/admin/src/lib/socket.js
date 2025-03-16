"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function getUsersFromTelegram(socket, telegramInstance = 'telegram.0', cb) {
    try {
        await socket.getState(`${telegramInstance}.communicate.users`).then((state) => {
            if (state?.val) {
                return cb(state.val);
            }
        });
    }
    catch (err) {
        console.error(`Error get Users vom Telegram: ${JSON.stringify(err)}`);
    }
}
async function getAllTelegramInstances(socket, callback) {
    const IDs = [];
    try {
        await socket.getObjectViewCustom('system', 'instance', '', '\u9999').then(objects => {
            Object.keys(objects).forEach(obj => {
                if (isAdapterTelegram(objects, obj)) {
                    IDs.push(objects[obj]._id.replace(/^system\.adapter\./, ''));
                }
            });
            callback(IDs);
        });
    }
    catch (err) {
        console.error(`Error getAllTelegramInstance: ${JSON.stringify(err)}`);
    }
    function isAdapterTelegram(objects, obj) {
        return 'telegram' === objects?.[obj]?.common.name;
    }
}
const getIobrokerData = {
    getUsersFromTelegram,
    getAllTelegramInstances,
};
exports.default = getIobrokerData;
//# sourceMappingURL=socket.js.map