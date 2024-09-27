import { AdminConnection } from "@iobroker/adapter-react-v5";
import helperFunction from "./Utils";

function getUsersFromTelegram(socket, telegramInstance = "telegram.0", cb): void {
	try {
		new Promise((resolve, reject) => {
			socket.getState(telegramInstance + ".communicate.users").then((state, err) => {
				if (state && state.val && !err) {
					resolve(cb(state.val));
				} else if (err) {
					reject(err);
					console.error("Error get Users vom Telegram: " + JSON.stringify(err));
				}
			});
		});
	} catch (err) {
		console.error("Error get Users vom Telegram: " + JSON.stringify(err));
	}
}

function getAllTelegramInstances(socket, callback): void {
	const IDs: string[] = [];
	try {
		socket.getObjectViewCustom("system", "instance", "", "\u9999").then((objects) => {
			Object.keys(objects).forEach((obj) => {
				if (
					(objects &&
						objects[obj] &&
						objects[obj].common &&
						objects[obj].common.titleLang &&
						objects[obj].common.titleLang.en &&
						objects[obj].common.titleLang.en == "Telegram") ||
					objects[obj].common.title == "Telegram"
				) {
					IDs.push(objects[obj]["_id"].replace(/^system\.adapter\./, ""));
				}
			});
			callback(IDs);
		});
	} catch (err) {
		console.error("Error getAllTelegramInstance: " + JSON.stringify(err));
	}
}

const getIobrokerData = {
	getUsersFromTelegram,
	getAllTelegramInstances,

};
export default getIobrokerData;
