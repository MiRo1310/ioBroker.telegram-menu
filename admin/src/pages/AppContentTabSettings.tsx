import React, {Component} from 'react';
import Input from '@components/btn-Input/input';
import Checkbox from '@components/btn-Input/checkbox';
import {I18n} from '@iobroker/adapter-react-v5';
import Select from '@components/btn-Input/select';
import type {PropsSettings} from '@/types/app';
import type {EventCheckbox, EventInput, EventSelect} from '@/types/event';
import {Grid2 as Grid} from '@mui/material';

class Settings extends Component<PropsSettings> {
    constructor(props: PropsSettings) {
        super(props);
        this.state = {
            value: '/opt/iobroker/grafana/',
            options: ['One', 'Two', 'Three'],
        };
    }

    onClickCheckbox = ({isChecked, id}: EventCheckbox): void => {
        const checkboxes = {...this.props.data.state.native.checkbox};
        checkboxes[id] = isChecked;
        this.props.callback.updateNative('checkbox', checkboxes);
    };

    componentDidMount(): void {
        if (!this.props.data.state.native.checkbox.sendMenuAfterRestart) {
            const checkboxes = {...this.props.data.state.native.checkbox};
            checkboxes.sendMenuAfterRestart = true;
            this.props.callback.updateNative('checkbox', checkboxes);
        }
    }

    render(): React.ReactNode {
        return (
            <div className="Settings">
                <h1>{I18n.t('settings')}</h1>
                <Grid
                    container
                    spacing={1}
                >
                    <Grid size={12}>
                        <Select
                            placeholder="placeholderInstance"
                            options={this.props.data.state.instances || []}
                            label={I18n.t('telegramInstance')}
                            name="instance"
                            selected={this.props.data.state.native.instance}
                            id="instance"
                            callback={({id, val}: EventSelect) => this.props.callback.updateNative(id, val)}
                            setNative={true}
                        />
                    </Grid>
                    <Grid size={{xs: 10, sm: 10, lg: 8}}>
                        <div className={'flex items-center'}>
                            <Input
                                label={I18n.t('textNoEntry')}
                                placeholder="No entry found"
                                callback={({id, val}: EventInput) => this.props.callback.updateNative(id, val)}
                                id="textNoEntry"
                                value={this.props.data.state.native.textNoEntry || I18n.t('entryNotFound')}
                                class={'input__container--settings'}
                            />
                            <Checkbox
                                label={I18n.t('active')}
                                id="checkboxNoValueFound"
                                isChecked={this.props.data.state.native.checkbox.checkboxNoValueFound || false}
                                callback={this.onClickCheckbox}
                                index={0}
                            />
                        </div>
                    </Grid>
                    <Grid size={{xs: 12, sm: 12, lg: 6}}>
                        <Input
                            label={I18n.t('Token Grafana')}
                            placeholder="Token Grafana"
                            callback={({id, val}: EventInput) => this.props.callback.updateNative(id, val)}
                            id="tokenGrafana"
                            value={this.props.data.state.native.tokenGrafana || ''}
                            class={'input__container--settings'}
                        />
                    </Grid>
                    <Grid size={{xs: 12, sm: 12, lg: 6}}>
                        <Input
                            label={I18n.t('Directory')}
                            placeholder="/opt/iobroker/media/"
                            callback={({id, val}: EventInput) => this.props.callback.updateNative(id, val)}
                            id="directory"
                            value={this.props.data.state.native.directory || '/opt/iobroker/media/'}
                            class={'input__container--settings'}
                        />
                    </Grid>
                    <Grid size={12}>
                        <Checkbox
                            label="Resize Keyboard"
                            id="resKey"
                            isChecked={this.props.data.state.native.checkbox.resKey || false}
                            callback={this.onClickCheckbox}
                            title="Requests clients to resize the keyboard vertically for optimal fit (e.g., make the keyboard smaller if there are just two rows of buttons). Defaults to false, in which case the custom keyboard is always of the same height as the app's standard keyboard."
                            class="title"
                            index={1}
                        />
                    </Grid>
                    <Grid size={12}>
                        <Checkbox
                            label="One Time Keyboard"
                            id="oneTiKey"
                            isChecked={this.props.data.state.native.checkbox.oneTiKey || false}
                            callback={this.onClickCheckbox}
                            title="oneTimeKey"
                            class="title"
                            index={2}
                        />
                    </Grid>
                    <Grid size={12}>
                        <Checkbox
                            label={I18n.t('sendMenuAfterRestart')}
                            id="sendMenuAfterRestart"
                            isChecked={
                                this.props.data.state.native.checkbox.sendMenuAfterRestart === null ||
                                this.props.data.state.native.checkbox.sendMenuAfterRestart === undefined
                                    ? true
                                    : this.props.data.state.native.checkbox.sendMenuAfterRestart
                            }
                            callback={this.onClickCheckbox}
                            index={3}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default Settings;
