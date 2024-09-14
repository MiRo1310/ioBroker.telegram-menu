import TelegramMenu from "../main";
import { debug, info } from "./logging";

export const checkIsTelegramActive = async (dataPoint: string): Promise<boolean | undefined> => {
	const _this = TelegramMenu.getInstance();
	_this.setState("info.connection", false, true);
	const telegramInfoConnection = await _this.getForeignStateAsync(dataPoint);

	debug([{ text: "Telegram Info Connection: ", val: telegramInfoConnection?.val }]);
	if (telegramInfoConnection?.val) {
		_this.setState("info.connection", telegramInfoConnection?.val, true);
	}
	if (!telegramInfoConnection?.val) {
		info([{ text: "Telegram was found, but is not running. Please start!" }]);
	}
	return telegramInfoConnection?.val ? true : false;
};
