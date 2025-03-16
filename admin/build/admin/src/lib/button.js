"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveRows = exports.deleteRow = exports.moveItem = void 0;
const Utils_1 = require("@/lib/Utils");
function getActiveMenuArray(data, card, subCard, activeMenu, index) {
    const dataCopy = (0, Utils_1.deepCopy)(data);
    const userArray = subCard ? dataCopy?.[card][activeMenu][subCard] : dataCopy?.[card][activeMenu];
    const element = userArray[index];
    userArray.splice(index, 1);
    return { activeMenuArray: userArray, element, dataCopy };
}
const moveItem = ({ index, data, card, subCard, activeMenu, updateNative, upDown, newPositionIndex, }) => {
    const { element, activeMenuArray, dataCopy } = getActiveMenuArray(data, card, subCard, activeMenu, index);
    if (upDown) {
        activeMenuArray.splice(index + upDown, 0, element);
    }
    if (newPositionIndex) {
        activeMenuArray.splice(newPositionIndex, 0, element);
    }
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = activeMenuArray;
    }
    else if (dataCopy) {
        dataCopy[card][activeMenu] = activeMenuArray;
    }
    updateNative('data', dataCopy);
};
exports.moveItem = moveItem;
const deleteRow = ({ index, data, card, subCard, activeMenu, updateNative, }) => {
    const { activeMenuArray, dataCopy } = getActiveMenuArray(data, card, subCard, activeMenu, index);
    if (subCard && dataCopy) {
        dataCopy[card][activeMenu][subCard] = activeMenuArray;
    }
    else if (dataCopy) {
        dataCopy[card][activeMenu] = activeMenuArray;
    }
    updateNative('data', dataCopy);
};
exports.deleteRow = deleteRow;
const moveRows = (action, index, data) => {
    const copyData = (0, Utils_1.deepCopy)(data);
    if (action === 'delete') {
        if (!copyData || copyData.length === 1) {
            return;
        }
        copyData.splice(index, 1);
        return copyData;
    }
    if (index === (action === 'up' ? 0 : data.length - 1) || !copyData) {
        return;
    }
    const temp = copyData[index];
    copyData.splice(index, 1);
    const newIndex = action === 'up' ? index - 1 : index + 1;
    copyData.splice(newIndex, 0, temp);
    return copyData;
};
exports.moveRows = moveRows;
//# sourceMappingURL=button.js.map