export interface EventTextarea {
    [key: string]: string;
}

export interface EventButton {
    innerText: string;
    id: string;
    value: string | number | boolean;
    index: number;
    event: React.MouseEvent<HTMLButtonElement>;
}

export interface EventInput {
    val: string | number | undefined;
    id: string;
    index: number | undefined;
}

export interface EventCheckbox {
    isChecked: boolean;
    id: string;
    index: number;
    params?: Record<string, unknown>;
}

export interface EventSelect {
    id: string;
    index: number;
    val: string;
}
export interface EventSelect {
    id: string;
    val: string;
}
