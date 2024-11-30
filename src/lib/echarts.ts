import TelegramMenu from '../main';
import { error } from './logging';
import { sendToTelegram } from './telegram';
import type { Echart, UserListWithChatId } from './telegram-menu';
function getChart(
    echarts: Echart[],
    directoryPicture: string,
    user: string,
    instanceTelegram: string,
    userListWithChatID: UserListWithChatId[],
    resize_keyboard: boolean,
    one_time_keyboard: boolean,
): void {
    const _this = TelegramMenu.getInstance();
    try {
        if (!echarts) {
            return;
        }
        for (const echart of echarts) {
            const splitted = echart.preset.split('.');
            const echartInstance = `${splitted[0]}.${splitted[1]}`;
            //TODO: Is filename ein string?
            _this.sendTo(
                echartInstance,
                {
                    preset: echart.preset,
                    renderer: 'jpg',
                    background: echart.background,
                    theme: echart.theme,
                    quality: 1.0,
                    fileOnDisk: directoryPicture + echart.filename,
                },
                (result: any) => {
                    sendToTelegram(
                        user,
                        result.error || directoryPicture + echart.filename,
                        [],
                        instanceTelegram,
                        resize_keyboard,
                        one_time_keyboard,
                        userListWithChatID,
                        '',
                    ).catch((e: any) => {
                        error([
                            { text: 'Error', val: e.message },
                            { text: 'Stack', val: e.stack },
                        ]);
                    });
                },
            );
        }
    } catch (e: any) {
        error([
            { text: 'Error:', val: e.message },
            { text: 'Stack:', val: e.stack },
        ]);
    }
}
export { getChart };
