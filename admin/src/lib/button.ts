import type { NativeData, UpdateNativeFunction } from '../../app';

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
    const dataCopy = JSON.parse(JSON.stringify(data));

    let userArray = [];

    if (subCard) {
        userArray = dataCopy[card][activeMenu][subCard];
    } else {
        userArray = dataCopy[card][activeMenu];
    }

    const element = userArray[index];
    userArray.splice(index, 1);
    if (upDown) {
        userArray.splice(index + upDown, 0, element);
    }
    if (newPositionIndex) {
        userArray.splice(newPositionIndex, 0, element);
    }
    if (subCard) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else {
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
    const dataCopy = JSON.parse(JSON.stringify(data));
    let userArray = [];
    if (subCard) {
        userArray = dataCopy[card][activeMenu][subCard];
    } else {
        userArray = dataCopy[card][activeMenu];
    }
    const element = userArray[index];
    userArray.splice(index, 1);
    userArray.splice(index + upDown, 0, element);
    if (subCard) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else {
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
    const dataCopy = JSON.parse(JSON.stringify(data));
    let userArray = [];
    if (subCard) {
        userArray = dataCopy[card][activeMenu][subCard];
    } else {
        userArray = dataCopy[card][activeMenu];
    }
    const element = userArray[index];
    userArray.splice(index, 1);
    userArray.splice(index - 1, 0, element);
    if (subCard) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else {
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
    const dataCopy = JSON.parse(JSON.stringify(data));
    let userArray = [];
    if (subCard) {
        userArray = dataCopy[card][activeMenu][subCard];
    } else {
        userArray = dataCopy[card][activeMenu];
    }
    userArray.splice(index, 1);
    if (subCard) {
        dataCopy[card][activeMenu][subCard] = userArray;
    } else {
        dataCopy[card][activeMenu] = userArray;
    }
    updateNative('data', dataCopy);
};
