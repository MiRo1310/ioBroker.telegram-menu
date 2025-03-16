"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultDropBoxCoordinates = exports.handleDraggable = exports.handleDragEnd = exports.handleStyleDragOver = exports.handleDragEnter = exports.handleDragOver = exports.handleDragStart = exports.handleMouseOut = exports.handleMouseOver = void 0;
const handleMouseOver = (e) => {
    const target = e?.target;
    if (target.classList.contains('noneDraggable')) {
        let currentElement = target;
        while (currentElement) {
            if (currentElement.tagName === 'TR' && !currentElement.classList.contains('SubTable')) {
                currentElement.draggable = false;
                return;
            }
            currentElement = currentElement.parentElement;
        }
    }
};
exports.handleMouseOver = handleMouseOver;
const handleMouseOut = (e) => {
    const target = e?.target;
    if (target.classList.contains('noneDraggable') && !target.classList.contains('draggingDropBox')) {
        let currentElement = target;
        while (currentElement) {
            if (currentElement.tagName === 'TR' && !currentElement.classList.contains('SubTable')) {
                currentElement.draggable = true;
                return;
            }
            currentElement = currentElement.parentElement;
        }
    }
};
exports.handleMouseOut = handleMouseOut;
const handleDragStart = (index, event, mouseOverNoneDraggable, setState, cbVal, cb) => {
    if (mouseOverNoneDraggable && event) {
        const target = event.target;
        target.style.userSelect = 'text';
        return false;
    }
    setState({ dropStart: index });
    if (cb) {
        cb(cbVal || {});
    }
};
exports.handleDragStart = handleDragStart;
const handleDragOver = (indexRow, event) => {
    event.preventDefault();
};
exports.handleDragOver = handleDragOver;
const handleDragEnter = (index, setState) => {
    setState({ dropOver: index });
};
exports.handleDragEnter = handleDragEnter;
const handleStyleDragOver = (index, dropOver, dropStart) => {
    return dropOver === index && dropStart > index
        ? { borderTop: '2px solid #3399cc' }
        : dropOver === index && dropStart < index
            ? { borderBottom: '2px solid #3399cc' }
            : {};
};
exports.handleStyleDragOver = handleStyleDragOver;
const handleDragEnd = (setState, setStateApp) => {
    setState({ dropStart: 0 });
    setState({ dropOver: 0 });
    if (setStateApp) {
        setStateApp({ draggingRowIndex: null });
    }
};
exports.handleDragEnd = handleDragEnd;
const handleDraggable = (index) => {
    return index === 0 ? 'false' : 'true';
};
exports.handleDraggable = handleDraggable;
function getDefaultDropBoxCoordinates(dropBox, dropDifferenzX, dropDifferenzY) {
    if (dropBox && dropBox.dropboxRight && dropBox.dropboxTop) {
        return { newX: dropBox.dropboxRight - dropDifferenzX, newY: dropBox.dropboxTop + dropDifferenzY };
    }
    return { newX: 5 - dropDifferenzX, newY: 105 + dropDifferenzY };
}
exports.getDefaultDropBoxCoordinates = getDefaultDropBoxCoordinates;
//# sourceMappingURL=dragNDrop.js.map