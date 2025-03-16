"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePositionDropBox = exports.onMouseLeave = exports.onMouseEnter = exports.onDrag = exports.onDrop = exports.onDragOver = exports.onDragEnd = exports.onDragStart = void 0;
const drag = { dragStartX: 0, dragStartY: 0, dragEndX: 0, dragEndY: 0 };
function onDragStart(event) {
    if (!event) {
        return;
    }
    drag.dragStartX = event.clientX;
    drag.dragStartY = event.clientY;
}
exports.onDragStart = onDragStart;
function onDragEnd(event, setState) {
    if (!event) {
        return;
    }
    event.preventDefault();
    drag.dragEndX = event.clientX;
    drag.dragEndY = event.clientY;
    const dropDifferenzY = drag.dragEndY - drag.dragStartY;
    const dropDifferenzX = drag.dragEndX - drag.dragStartX;
    if (setState) {
        setState({ dropDifferenzY: dropDifferenzY, dropDifferenzX: dropDifferenzX });
    }
}
exports.onDragEnd = onDragEnd;
function onDragOver(event) {
    if (!event) {
        return;
    }
    event.preventDefault();
}
exports.onDragOver = onDragOver;
function onDrop(event) {
    if (!event) {
        return;
    }
    event.preventDefault();
}
exports.onDrop = onDrop;
function onDrag(event) {
    if (!event) {
        return;
    }
    event.preventDefault();
}
exports.onDrag = onDrag;
function onMouseEnter() {
    document.querySelectorAll('tr[draggable],span[draggable]').forEach(element => {
        element.classList.add('draggingDropBox');
    });
}
exports.onMouseEnter = onMouseEnter;
function onMouseLeave() {
    document.querySelectorAll('tr[draggable],span[draggable]').forEach(element => {
        element.draggable = true;
        element.classList.remove('draggingDropBox');
    });
}
exports.onMouseLeave = onMouseLeave;
const updatePositionDropBox = (newX, newY, dropboxRef, showDropBox, dropbox) => {
    if (dropboxRef?.current != null && showDropBox) {
        if (!(newX || newY)) {
            newX = parseInt(dropboxRef.current.style.right.replace('px', ''));
            newY = parseInt(dropboxRef.current.style.top.replace('px', ''));
        }
        const element = document.querySelector('.adapter-container');
        const { maxTop, maxRight } = computeMaxPosition(element, dropboxRef);
        const { y, x } = calculateNewPosition({ maxTop, maxRight, newX, newY, dropbox });
        dropboxRef.current.style.top = `${y}px`;
        dropboxRef.current.style.right = `${x}px`;
    }
};
exports.updatePositionDropBox = updatePositionDropBox;
function computeMaxPosition(element, dropboxRef) {
    return {
        maxTop: element?.offsetHeight - (dropboxRef?.current?.offsetHeight || 0),
        maxRight: element?.offsetWidth - (dropboxRef?.current?.offsetWidth || 0),
    };
}
function calculateNewPosition({ maxTop, maxRight, newX, newY, dropbox, }) {
    if (newY && newX) {
        return { y: adjustYCoordinate(newY, maxTop), x: adjustXCoordinate(newX, maxRight) };
    }
    if (dropbox && dropbox.dropboxRight && dropbox.dropboxTop) {
        return { x: dropbox.dropboxRight, y: dropbox.dropboxTop };
    }
    return { y: 105, x: 5 };
}
function adjustXCoordinate(newX, maxRight) {
    if (newX < 1) {
        return 1;
    }
    return newX > maxRight ? maxRight : newX;
}
function adjustYCoordinate(newY, maxTop) {
    if (newY < 1) {
        return 1;
    }
    return newY > maxTop ? maxTop : newY;
}
//# sourceMappingURL=movePosition.js.map