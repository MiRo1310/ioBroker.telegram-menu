type UsersInGroup = Record<string, unknown[] | undefined>;

export function menuNameExists(name: string, usersInGroup: UsersInGroup): boolean {
    return name !== '' && !!usersInGroup?.[name.replace(/ /g, '_')];
}

export function isInvalidNewMenuName(newMenu: string, oldMenuName: string): boolean {
    return newMenu === '' || newMenu == undefined || newMenu === oldMenuName;
}
