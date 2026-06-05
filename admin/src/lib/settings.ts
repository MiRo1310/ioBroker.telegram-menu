import { isDefined } from '@backend/lib/utils';
import type { Checkboxes, InstanceList } from '@/types/app';

export function shouldDefaultSendMenuAfterRestart(value: boolean | undefined | null): boolean {
    return !isDefined(value);
}

export function getCheckboxDisplayValue(value: boolean | undefined | null): boolean {
    return !isDefined(value) ? true : value;
}

export function getUpdatedCheckboxes(current: Checkboxes, id: string, isChecked: boolean): Checkboxes {
    return { ...current, [id]: isChecked };
}

export function getUpdatedInstanceList(
    allInstances: string[],
    currentList: InstanceList[] | undefined,
    index: number,
    isChecked: boolean,
): InstanceList[] {
    const instances = [...(currentList ?? [])];
    instances[index] = { name: allInstances[index], active: isChecked };
    return instances.filter(isDefined);
}
