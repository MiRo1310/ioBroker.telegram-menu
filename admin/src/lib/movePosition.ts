import type { Dropbox, SetStateFunction } from '@/types/app';
import type { DragEvent } from 'react';

const drag = { dragStartX: 0, dragStartY: 0, dragEndX: 0, dragEndY: 0 };

export function onDragStart(event: DragEvent<HTMLDivElement>): void {
    if (!event) {
        return;
    }
    drag.dragStartX = event.clientX;
    drag.dragStartY = event.clientY;
}

export function onDragEnd(event: DragEvent<HTMLDivElement>, setState?: SetStateFunction): void {
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

export function onDragOver(event: React.DragEvent<HTMLDivElement>): void {
    if (!event) {
        return;
    }
    event.preventDefault();
}

export function onDrop(event: React.DragEvent<HTMLDivElement>): void {
    if (!event) {
        return;
    }
    event.preventDefault();
}

export function onDrag(event: React.DragEvent<HTMLDivElement>): void {
    if (!event) {
        return;
    }
    event.preventDefault();
}

export function onMouseEnter(): void {
    document.querySelectorAll('tr[draggable],span[draggable]').forEach(element => {
        element.classList.add('draggingDropBox');
    });
}

export function onMouseLeave(): void {
    document.querySelectorAll('tr[draggable],span[draggable]').forEach(element => {
        (element as HTMLElement).draggable = true;
        element.classList.remove('draggingDropBox');
    });
}

export const updatePositionDropBox = (
    newX: Dropbox.newX,
    newY: Dropbox.newY,
    dropboxRef: Dropbox.Ref,
    showDropBox: boolean,
    dropbox: Dropbox.Position,
): void => {
    if (dropboxRef?.current != null && showDropBox) {
        if (!(newX || newY)) {
            newX = parseInt(dropboxRef.current.style.right.replace('px', ''));
            newY = parseInt(dropboxRef.current.style.top.replace('px', ''));
        }
        const element = document.querySelector('.adapter-container') as HTMLElement;
        const { maxTop, maxRight } = computeMaxPosition(element, dropboxRef);

        const { y, x } = calculateNewPosition({ maxTop, maxRight, newX, newY, dropbox });

        dropboxRef.current.style.top = `${y}px`;
        dropboxRef.current.style.right = `${x}px`;
    }
};
function computeMaxPosition(element: HTMLElement, dropboxRef: Dropbox.Ref): { maxTop: number; maxRight: number } {
    return {
        maxTop: element?.offsetHeight - (dropboxRef?.current?.offsetHeight || 0),
        maxRight: element?.offsetWidth - (dropboxRef?.current?.offsetWidth || 0),
    };
}

function calculateNewPosition({
    maxTop,
    maxRight,
    newX,
    newY,
    dropbox,
}: {
    dropbox: Dropbox.Position;
    newX: Dropbox.newX;
    newY: Dropbox.newY;
    maxTop: number;
    maxRight: number;
}): { y: number; x: number } {
    if (newY && newX) {
        return { y: adjustYCoordinate(newY, maxTop), x: adjustXCoordinate(newX, maxRight) };
    }
    if (dropbox && dropbox.dropboxRight && dropbox.dropboxTop) {
        return { x: dropbox.dropboxRight, y: dropbox.dropboxTop };
    }
    return { y: 105, x: 5 };
}

function adjustXCoordinate(newX: number, maxRight: number): number {
    if (newX < 1) {
        return 1;
    }
    return newX > maxRight ? maxRight : newX;
}

function adjustYCoordinate(newY: number, maxTop: number): number {
    if (newY < 1) {
        return 1;
    }
    return newY > maxTop ? maxTop : newY;
}
