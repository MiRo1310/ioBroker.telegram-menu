import React, {Component} from 'react';
import Select from '@components/btn-Input/select';
import type {EventSelect} from '@/types/event';
import Button from '../components/Button';
import type {DataMainContent, TabValueEntries} from '@/types/app';
import {getMenusToSearchIn} from '@/lib/actionUtils';
import {deleteDoubleEntriesInArray} from '@/lib/Utils';
import {I18n} from '@iobroker/adapter-react-v5';

interface Props {
    callback: (e: string) => void;
    data: DataMainContent & { entries: TabValueEntries[] };
}

interface State {
    selected: string;
}

class AppContentTabNavigationTableRowEditorCardTriggerSelection extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            selected: '',
        };
    }

    addSelectedMenuToInputAsButton = (): void => {
        this.props.callback(this.state.selected);
        this.setState({selected: ''});
    };

    setSelectedItem(e: EventSelect): void {
        this.setState({selected: e.val});
    }

    getSelectOptions = (): string[] => {
        const nav = this.props.data.state.native.data.nav;
        const users = this.props.data.state.native.usersInGroup;
        const activeMenu = this.props.data.state.activeMenu;
        const menus = deleteDoubleEntriesInArray(getMenusToSearchIn(users[activeMenu], users));

        let options: string[] = [];
        menus.forEach(menu => {
            nav[menu].forEach(trigger => {
                options.push(trigger.call);
            });
        });

        options = options
            .map(item => item.trim())
            .filter(trigger => !['-', ''].includes(trigger))
            .sort();

        return options;
    };

    render(): React.ReactNode {
        return (
            <div className="flex items-center mt-2">
                <p className="mr-2">{I18n.t('addCreatedMenus')}</p>
                <div>
                    <Select
                        id={'nav-triggers'}
                        options={this.getSelectOptions()}
                        placeholder={I18n.t('choose')}
                        selected={this.state.selected}
                        callback={e => this.setSelectedItem(e)}
                    />
                </div>
                <Button
                    id={'button'}
                    callback={this.addSelectedMenuToInputAsButton}
                    className={`button__ok button ${this.state.selected === '' ? 'button__disabled' : ''}`}
                    disabled={this.state.selected === ''}
                >
                    {I18n.t('add')}
                </Button>
            </div>
        );
    }
}

export default AppContentTabNavigationTableRowEditorCardTriggerSelection;
