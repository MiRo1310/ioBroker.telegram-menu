import React, { Component } from 'react';
import Input from '@components/btn-Input/input';
import Checkbox from '@components/btn-Input/checkbox';
import { I18n } from '@iobroker/adapter-react-v5';
import type { PropsSettings } from '@/types/app';
import type { EventCheckbox, EventInput } from '@/types/event';
import { Grid } from '@mui/material';
import {
    shouldDefaultSendMenuAfterRestart,
    getCheckboxDisplayValue,
    getUpdatedCheckboxes,
    getUpdatedInstanceList,
} from '@/lib/settings';
import SectionTitle from '@components/SectionTitle';
import SettingsCheckboxRow from '@components/SettingsCheckboxRow';
import TelegramInstanceList from '@components/TelegramInstanceList';

class SettingsTab extends Component<PropsSettings> {
    onClickCheckbox = ({ isChecked, id }: EventCheckbox): void => {
        const updated = getUpdatedCheckboxes(this.props.data.state.native.checkbox, id, isChecked);
        this.props.callback.updateNative('checkbox', updated);
    };

    onClickInstanceCheckbox = ({ isChecked, index }: EventCheckbox): void => {
        const updated = getUpdatedInstanceList(
            this.props.data.state.instances,
            this.props.data.state.native.instanceList,
            index,
            isChecked,
        );
        this.props.callback.updateNative('instanceList', updated);
    };

    componentDidMount(): void {
        if (shouldDefaultSendMenuAfterRestart(this.props.data.state.native.checkbox.sendMenuAfterRestart)) {
            const checkboxes = { ...this.props.data.state.native.checkbox };
            checkboxes.sendMenuAfterRestart = true;
            this.props.callback.updateNative('checkbox', checkboxes);
        }
        if (!this.props.data.state.native.textNoEntry) {
            this.props.callback.updateNative('textNoEntry', I18n.t('entryNotFound'));
        }
    }

    render(): React.ReactNode {
        const { native, instances } = this.props.data.state;
        const { checkbox } = native;

        return (
            <div className="settings__tab">
                <SectionTitle
                    title={I18n.t('settings')}
                    tag="h1"
                    className=""
                />
                <Grid
                    container
                    spacing={1}
                >
                    <SectionTitle title={I18n.t('telegramInstances')} />
                    <TelegramInstanceList
                        instances={instances}
                        instanceList={native.instanceList}
                        onChange={this.onClickInstanceCheckbox}
                    />
                    <Grid size={{ xs: 10, sm: 10, lg: 8 }}>
                        <div
                            className={'flex items-start'}
                            style={{ alignItems: 'baseline' }}
                        >
                            <Input
                                label={I18n.t('textNoEntry')}
                                placeholder="No entry found"
                                callback={({ id, val }: EventInput) => this.props.callback.updateNative(id, val)}
                                id="textNoEntry"
                                value={native.textNoEntry ?? I18n.t('entryNotFound')}
                                class={'input__container--settings'}
                            />
                            <Checkbox
                                label={I18n.t('active')}
                                id="checkboxNoValueFound"
                                isChecked={checkbox.checkboxNoValueFound ?? false}
                                callback={this.onClickCheckbox}
                                index={0}
                            />
                        </div>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
                        <Input
                            label={I18n.t('Token Grafana')}
                            placeholder="Token Grafana"
                            callback={({ id, val }: EventInput) => this.props.callback.updateNative(id, val)}
                            id="tokenGrafana"
                            value={native.tokenGrafana || ''}
                            class={'input__container--settings'}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
                        <Input
                            label={I18n.t('Directory')}
                            placeholder="/opt/iobroker/media/"
                            callback={({ id, val }: EventInput) => this.props.callback.updateNative(id, val)}
                            id="directory"
                            value={native.directory ?? '/opt/iobroker/media/'}
                            class={'input__container--settings'}
                        />
                    </Grid>
                    <SettingsCheckboxRow
                        label="Resize Keyboard"
                        id="resKey"
                        isChecked={checkbox.resKey ?? false}
                        onChange={this.onClickCheckbox}
                        index={1}
                        title="Requests clients to resize the keyboard vertically for optimal fit (e.g., make the keyboard smaller if there are just two rows of buttons). Defaults to false, in which case the custom keyboard is always of the same height as the app's standard keyboard."
                    />
                    <SettingsCheckboxRow
                        label="One Time Keyboard"
                        id="oneTiKey"
                        isChecked={checkbox.oneTiKey ?? false}
                        onChange={this.onClickCheckbox}
                        index={2}
                        title="oneTimeKey"
                    />
                    <SettingsCheckboxRow
                        label={I18n.t('sendMenuAfterRestart')}
                        id="sendMenuAfterRestart"
                        isChecked={getCheckboxDisplayValue(checkbox.sendMenuAfterRestart)}
                        onChange={this.onClickCheckbox}
                        index={3}
                    />
                </Grid>
            </div>
        );
    }
}

export default SettingsTab;
