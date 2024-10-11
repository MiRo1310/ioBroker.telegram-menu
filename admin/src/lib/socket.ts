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
	const identification: string[] = [];
	try {
		socket.getObjectViewCustom("system", "instance", "", "\u9999").then((objects) => {
			Object.keys(objects).forEach((obj) => {
				if (isAdapterTelegram(objects, obj)) {
					identification.push(objects[obj]["_id"].replace(/^system\.adapter\./, ""));
				}
			});
			callback(identification);
		});
	} catch (err) {
		console.error("Error getAllTelegramInstance: " + JSON.stringify(err));
	}

	function isAdapterTelegram(objects: Record<string, ioBroker.InstanceObject & { type: "instance" }>, obj: string): boolean {
		const titleLang = objects?.[obj]?.common?.titleLang;
		if (!titleLang) {
			return false;
		}
		return typeof titleLang === "object" && "en" in titleLang && titleLang.en === "Telegram";
	}
}

const getIobrokerData = {
	getUsersFromTelegram,
	getAllTelegramInstances,
};
export default getIobrokerData;
