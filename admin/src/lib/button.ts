import { deepCopy } from '@/lib/Utils';
import type { NativeData, UpdateNativeFunction } from '@/types/app';

function getUserArray(
    data: NativeData,
    card: string,
    subCard: string | undefined,
    activeMenu: string,
    index: number,
): {
    userArray: string[];
    element: string;
    dataCopy: NativeData | undefined;
} {
    const dataCopy = deepCopy(data);

    let userArray: string[];

    if (subCard) {
        userArray = dataCopy?.[card][activeMenu][subCard];
    } else {
        userArray = dataCopy?.[card][activeMenu];
    }

    const element = userArray[index];
    userArray.splice(index, 1);
    return { userArray, element, dataCopy };
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
    const { element, userArray, dataCopy } = getUserArray(data, card, subCard, activeMenu, index);

    if (upDown) {
        userArray.splice(index + upDown, 0, element);
    }
    if (newPositionIndex) {
        userArray.splice(newPositionIndex, 0, element);
    }
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = userArray;
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
    const { element, userArray, dataCopy } = getUserArray(data, card, subCard, activeMenu, index);
    userArray.splice(index + upDown, 0, element);
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = userArray;
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
    const { element, userArray, dataCopy } = getUserArray(data, card, subCard, activeMenu, index);

    userArray.splice(index - 1, 0, element);
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = userArray;
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
    const { userArray, dataCopy } = getUserArray(data, card, subCard, activeMenu, index);

    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else if (dataCopy) {
        dataCopy[card][activeMenu] = userArray;
    }
    updateNative('data', dataCopy);
};
