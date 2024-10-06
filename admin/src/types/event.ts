export interface EventTextarea {
    val: string;
    index: number;
    id: string;
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