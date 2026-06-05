import React from 'react';
import Checkbox from '@components/btn-Input/checkbox';
import { Grid } from '@mui/material';
import type { EventCheckbox } from '@/types/event';

interface Props {
    label: string;
    id: string;
    isChecked: boolean;
    onChange: (e: EventCheckbox) => void;
    index: number;
    title?: string;
}

function SettingsCheckboxRow({ label, id, isChecked, onChange, index, title }: Props): React.ReactElement {
    return (
        <Grid size={12}>
            <Checkbox
                label={label}
                id={id}
                isChecked={isChecked}
                callback={onChange}
                title={title}
                class={title ? 'title' : undefined}
                index={index}
            />
        </Grid>
    );
}

export default SettingsCheckboxRow;
