import React from 'react';
import Checkbox from '@components/btn-Input/checkbox';
import { Grid } from '@mui/material';
import type { InstanceList } from '@/types/app';
import type { EventCheckbox } from '@/types/event';

interface Props {
    instances: string[];
    instanceList: InstanceList[] | undefined;
    onChange: (e: EventCheckbox) => void;
}

function TelegramInstanceList({ instances, instanceList, onChange }: Props): React.ReactElement {
    return (
        <Grid size={12}>
            {instances.map((instance, index) => (
                <p
                    className="settings__telegram-checkbox"
                    key={`checkbox-${index}`}
                >
                    <Checkbox
                        label={instance}
                        id="instance"
                        isChecked={instanceList?.[index]?.active ?? false}
                        callback={onChange}
                        index={index}
                    />
                </p>
            ))}
        </Grid>
    );
}

export default TelegramInstanceList;
