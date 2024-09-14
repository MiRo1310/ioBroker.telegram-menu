import TelegramMenu from "../main";
import { deleteDoubleEntriesInArray } from "./global";
import { debug } from "./logging";

async function _subscribeAndUnSubscribeForeignStatesAsync(obj: { array?: SetStateIds[]; id?: string }): Promise<void> {
	const _this = TelegramMenu.getInstance();
	if (obj.id) {
		debug([
			{ text: "ID to subscribe:", val: obj.id },
			{ text: "Subscribe:", val: await _this.subscribeForeignStatesAsync(obj.id) },
		]);
	} else if (obj.array) {
		obj.array.forEach((element) => {
			_this.subscribeForeignStatesAsync(element["id"]);
		});
	}
}

async function _subscribeForeignStatesAsync(array: string[]): Promise<void> {
	const _this = TelegramMenu.getInstance();
	array = deleteDoubleEntriesInArray(array);
	array.forEach(async (element) => {
		await _this.subscribeForeignStatesAsync(element);
	});
	debug([{ text: "Subscribe all States of:", val: array }]);
}

export { _subscribeAndUnSubscribeForeignStatesAsync, _subscribeForeignStatesAsync };
