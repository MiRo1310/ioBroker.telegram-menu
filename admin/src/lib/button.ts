import { deepCopy } from '@/lib/Utils';
import type { NativeData, UpdateNativeFunction } from '@/types/app';

function getActiveMenuArray(
    data: NativeData,
    card: string,
    subCard: string | undefined,
    activeMenu: string,
    index: number,
): {
    activeMenuArray: string[];
    element: string;
    dataCopy: NativeData | undefined;
} {
    const dataCopy = deepCopy(data);
    const userArray = subCard ? dataCopy?.[card][activeMenu][subCard] : dataCopy?.[card][activeMenu];

    const element = userArray[index];
    userArray.splice(index, 1);
    return { activeMenuArray: userArray, element, dataCopy };
}

export const moveItem = ({
    index,
    data,
    card,
    subCard,
    activeMenu,
    updateNative,
    upDown,
    newPositionIndex,
}: {
    newPositionIndex?: number;
    upDown: number;
    updateNative: UpdateNativeFunction;
    activeMenu: string;
    index: number;
    data: NativeData;
    card: string;
    subCard?: string;
}): void => {
    const { element, activeMenuArray, dataCopy } = getActiveMenuArray(data, card, subCard, activeMenu, index);

    if (upDown) {
        activeMenuArray.splice(index + upDown, 0, element);
    }
    if (newPositionIndex) {
        activeMenuArray.splice(newPositionIndex, 0, element);
    }
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = activeMenuArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = activeMenuArray;
    }
    updateNative('data', dataCopy);
};

export const moveDown = ({
    index,
    data,
    card,
    subCard,
    activeMenu,
    updateNative,
    upDown,
}: {
    upDown: number;
    updateNative: UpdateNativeFunction;
    activeMenu: string;
    index: number;
    data: NativeData;
    card: string;
    subCard?: string;
}): void => {
    const { element, activeMenuArray, dataCopy } = getActiveMenuArray(data, card, subCard, activeMenu, index);
    activeMenuArray.splice(index + upDown, 0, element);
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = activeMenuArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = activeMenuArray;
    }
    updateNative('data', dataCopy);
};

export const moveUp = ({
    index,
    data,
    card,
    subCard,
    activeMenu,
    updateNative,
}: {
    updateNative: UpdateNativeFunction;
    activeMenu: string;
    index: number;
    data: NativeData;
    card: string;
    subCard?: string;
}): void => {
    const { element, activeMenuArray, dataCopy } = getActiveMenuArray(data, card, subCard, activeMenu, index);

    activeMenuArray.splice(index - 1, 0, element);
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = activeMenuArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = activeMenuArray;
    }
    updateNative('data', dataCopy);
};

export const deleteRow = ({
    index,
    data,
    card,
    subCard,
    activeMenu,
    updateNative,
}: {
    updateNative: UpdateNativeFunction;
    activeMenu: string;
    index: number;
    data: NativeData;
    card: string;
    subCard?: string;
}): void => {
    const { activeMenuArray, dataCopy } = getActiveMenuArray(data, card, subCard, activeMenu, index);

    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = activeMenuArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = activeMenuArray;
    }
    updateNative('data', dataCopy);
};
