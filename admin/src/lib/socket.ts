import { socket } from "../../app";

function getUsersFromTelegram(socket: socket, telegramInstance = "telegram.0", cb: (val: string) => void): void {
	try {
		new Promise((resolve) => {
			socket.getState(telegramInstance + ".communicate.users").then((state: any) => {
				if (state && state.val) {
					resolve(cb(state.val));
				}
			});
		});
	} catch (err) {
		console.error("Error get Users vom Telegram: " + JSON.stringify(err));
	}
}

function getAllTelegramInstances(socket: socket, callback: (val: string[]) => void): void {
	const IDs: string[] = [];
	try {
		socket.getObjectViewCustom("system", "instance", "", "\u9999").then((objects) => {
			Object.keys(objects).forEach((obj) => {
				if (isAdapterTelegram(objects, obj)) {
					IDs.push(objects[obj]["_id"].replace(/^system\.adapter\./, ""));
				}
			});
			callback(IDs);
		});
	} catch (err) {
		console.error("Error getAllTelegramInstance: " + JSON.stringify(err));
	}

	function isAdapterTelegram(objects: Record<string, any & { type: "instance" }>, obj: string): boolean {
		return "telegram" === objects?.[obj]?.common.name;
	}
}
const getIobrokerData = {
	getUsersFromTelegram,
	getAllTelegramInstances,
};
export default getIobrokerData;
