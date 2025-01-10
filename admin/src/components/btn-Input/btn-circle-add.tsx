import React from 'react';
import type { BtnCircleAddTypeProps } from '@/types/props-types';

export const BtnCircleAdd = (props: BtnCircleAddTypeProps): React.JSX.Element => {
    const clickHandler = (): void => {
        props.callback();
    };

    return (
        <div className="btn__circle_add">
            <a onClick={clickHandler}>
                <i className="material-icons">add_circle</i>
            </a>
        </div>
    );
};
