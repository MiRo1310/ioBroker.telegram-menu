import type { socket } from '@/types/app';

async function getUsersFromTelegram(
    socket: socket,
    telegramInstance = 'telegram.0',
): Promise<string | number | boolean | undefined> {
    try {
        const state = await socket.getState(`${telegramInstance}.communicate.users`);
        if (state?.val) {
            return state.val;
        }
    } catch (err) {
        console.error(`Error get Users vom Telegram: ${JSON.stringify(err)}`);
    }
}

async function getAllTelegramInstances(socket: socket, callback: (val: string[]) => void): Promise<void> {
    const IDs: string[] = [];
    try {
        await socket.getObjectViewCustom('system', 'instance', '', '\u9999').then(objects => {
            Object.keys(objects).forEach(obj => {
                if (isAdapterTelegram(objects, obj)) {
                    IDs.push(objects[obj]._id.replace(/^system\.adapter\./, ''));
                }
            });
            callback(IDs);
        });
    } catch (err) {
        console.error(`Error getAllTelegramInstance: ${JSON.stringify(err)}`);
    }

    function isAdapterTelegram(objects: { [key: string]: { common: { name: string } } }, obj: string): boolean {
        return 'telegram' === objects?.[obj]?.common.name;
    }
}

const getIobrokerData = {
    getUsersFromTelegram,
    getAllTelegramInstances,
};
export default getIobrokerData;
