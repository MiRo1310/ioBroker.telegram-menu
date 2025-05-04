export const isMenuBack = (str: string): boolean => str.includes('menu:back');
export const isDeleteMenu = (str: string): boolean => str.includes('delete');
export const isCreateSwitch = (str: string): boolean => str.includes('switch');
export const isFirstMenuValue = (str: string): boolean => str.includes('first');
export const isSecondMenuValue = (str: string): boolean => str.includes('second');
export const isCreateDynamicSwitch = (str: string): boolean => str.includes('dynSwitch');
export const isSetDynamicSwitchVal = (str: string): boolean => str.includes('dynS');
export const isSubmenuOrMenu = (val: string): boolean => val.startsWith('menu') || val.startsWith('submenu');
export const isCreateSubmenuPercent = (menuString: string, cbData: string): boolean =>
    !menuString.includes('submenu') && cbData.includes('percent');

export const isSetSubmenuPercent = (menuString: string, step: number): boolean =>
    menuString.includes(`submenu:percent${step}`);

export const isSetSubmenuNumber = (menuString: string, cbData: string): boolean =>
    menuString.includes(`submenu:${cbData}`);

export function isCreateSubmenuNumber(menuString: string, callbackData: string): boolean {
    return !menuString.includes('submenu') && callbackData.includes('number');
}
