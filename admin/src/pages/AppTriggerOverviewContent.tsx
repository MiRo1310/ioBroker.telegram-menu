import { I18n } from '@iobroker/adapter-react-v5';
import type { MenuWithUser, PropsTriggerOverview, StateTriggerOverview } from '@/types/app.js';
import React, { Component } from 'react';
import Select from '../components/btn-Input/select.js';
import { deepCopy, deleteDoubleEntriesInArray } from '@/lib/Utils';
import { updateTriggerForSelect } from '@/lib/actionUtils';
import { colors } from '@/lib/color';
import Square from './AppTriggerOverviewContentSquare.js';
import type { EventSelect } from '@/types/event';

class TriggerOverview extends Component<PropsTriggerOverview, StateTriggerOverview> {
    constructor(props: PropsTriggerOverview) {
        super(props);
        this.state = {
            ulPadding: {},
            trigger: null,
            selected: '',
            options: [],
        };
    }

    dataOfIterate = { menu: '' };
    ulPadding = {};
    colorArray: { color: string; menu: string; index: number }[] = [];
    menuArray: string[] = [];

    getMenusWithUserOrIndexOfMenu(menuCall: string): { menusWithUser: MenuWithUser[]; arrayUsersInGroup: string[] } {
        const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
        const menusWithUser: MenuWithUser[] = [];
        const userInMenu = this.props.usersInGroup[menuCall];
        arrayUsersInGroup.forEach((menu, index) => {
            userInMenu.forEach(user => {
                if (this.props.usersInGroup[menu].includes(user)) {
                    menusWithUser.push({ menu: menu, index: index });
                }
            });
        });

        return { menusWithUser: menusWithUser, arrayUsersInGroup: arrayUsersInGroup };
    }

    getIndexOfMenu(menuCall: string): number {
        const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
        let colorIndex = 0;
        const userInMenu = this.props.usersInGroup[menuCall];
        arrayUsersInGroup.forEach((menu, index) => {
            userInMenu.forEach(user => {
                if (this.props.usersInGroup[menu].includes(user) && menu == menuCall) {
                    colorIndex = index;
                }
            });
        });
        return colorIndex;
    }

    getColorUsedTriggerNav({
        menuCall,
        trigger,
    }: {
        index: number;
        menuCall: string;
        trigger: string;
    }): { color: string; menu: string; index: number | null; used?: string }[] | undefined {
        this.menuArray = [];
        const result = this.getMenusWithUserOrIndexOfMenu(menuCall);
        const menusWithUser = deleteDoubleEntriesInArray(result.menusWithUser);
        this.colorArray = [];

        for (const menu of menusWithUser) {
            if (!this.ulPadding[menuCall]) {
                this.ulPadding[menuCall] = 0;
            }

            if (
                this.state.trigger?.everyTrigger[menu.menu] &&
                this.state.trigger?.everyTrigger[menu.menu].includes(trigger)
            ) {
                for (let key = 0; key < result.arrayUsersInGroup.length; key++) {
                    if (result.arrayUsersInGroup[key] === menu.menu) {
                        if (!this.menuArray.includes(menu.menu)) {
                            this.menuArray.push(menu.menu);
                        }
                        this.colorArray.push({ color: colors[menu.index], menu: menu.menu, index: key });
                        if (this.ulPadding[menuCall] < (this.colorArray.length - 4) * 11 + 15) {
                            this.ulPadding[menuCall] = (this.colorArray.length - 4) * 11 + 15;
                        }
                    }
                }
            }
        }
        if (this.colorArray.length !== 0) {
            return this.colorArray;
        }
        if (trigger == '-' && this.ulPadding[menuCall] != 37) {
            this.ulPadding[menuCall] = 10;
        } else if (this.ulPadding[menuCall] < 37) {
            this.ulPadding[menuCall] = 37;
        }
        return [{ color: 'white', menu: 'Is not assigned ', index: null, used: I18n.t('not created') }];
    }

    getColorNavElemente(index: number, menu: string, trigger: string): undefined | string {
        const arrayUsersInGroup = Object.keys(this.props.usersInGroup);
        const result = this.getMenusWithUserOrIndexOfMenu(menu);

        const menusWithUser = result.menusWithUser;
        // Jedes Menü durchlaufen das zu dem User oder den Usern gehört in dem das Item ist
        let menu2 = '';
        for (const menuObj of menusWithUser) {
            menu2 = menuObj.menu;
            // Die Trigger durchlaufen die in dem Menü in nav sind
            if (
                this.state.trigger?.usedTrigger.nav[menu2] &&
                this.state.trigger?.usedTrigger.nav[menu2].includes(trigger)
            ) {
                // Dann ermitteln welchen key das menu hat
                for (let key = 0; key < arrayUsersInGroup.length; key++) {
                    if (arrayUsersInGroup[key] === menu2) {
                        this.dataOfIterate.menu = menu2;

                        return colors[key];
                    }
                }
            } else {
                // Wenn es nicht in Nav ist muss es in Action sein, ansonsten ist der Trigger unbenutzt
                for (const action in this.state.trigger?.usedTrigger.action[menu2]) {
                    if (this.state.trigger.usedTrigger.action[menu2][action].includes(trigger)) {
                        for (let key = 0; key < arrayUsersInGroup.length; key++) {
                            if (arrayUsersInGroup[key] === menu2) {
                                this.dataOfIterate.menu = menu2;

                                return colors[key];
                            }
                        }
                    }
                }
            }
        }

        if (!this.ulPadding[menu]) {
            this.ulPadding[menu] = 0;
        }
        if (this.ulPadding[menu] < 37) {
            this.ulPadding[menu] = 37;
        }
        return 'black';
    }

    getMenu(): string {
        return this.dataOfIterate.menu;
    }

    createdData(menu: string): void {
        const result = updateTriggerForSelect(this.props.data, this.props.usersInGroup, menu);
        this.setState({ trigger: deepCopy(result?.triggerObj) });
    }

    getOptions(): void {
        const options: string[] = [];
        for (const menu in this.props.data.nav) {
            if (this.props.data.nav[menu][0].call != '-') {
                options.push(menu);
            }
        }
        this.setState({ options: options, selected: options[0] });
        this.createdData(options[0]);
    }

    componentDidMount(): void {
        this.getOptions();
        this.setState({ ulPadding: this.ulPadding });
    }

    componentDidUpdate(prevProps: Readonly<PropsTriggerOverview>, prevState: Readonly<StateTriggerOverview>): void {
        if (prevState.trigger != this.state.trigger) {
            this.setState({ ulPadding: this.ulPadding });
        }
    }

    updateHandler = ({ val }: EventSelect): void => {
        this.setState({ selected: val });
        this.createdData(val);
    };

    render(): React.ReactNode {
        return (
            <>
                <Select
                    options={this.state.options}
                    label={I18n.t('startMenus')}
                    name="instance"
                    selected={this.state.selected}
                    id="startMenu"
                    callback={this.updateHandler}
                />
                {this.state.trigger ? (
                    <div className="Menu-list-container">
                        <div className="Menu-list-card">
                            <p>{I18n.t('unusedTrigger')}</p>
                            <ul>
                                {this.state.trigger.unUsedTrigger.map((trigger, index) => {
                                    return (
                                        <div
                                            key={index}
                                            style={{ position: 'relative' }}
                                        >
                                            <Square
                                                color="black"
                                                position={0}
                                                noText={true}
                                            />
                                            <li>{trigger}</li>
                                        </div>
                                    );
                                })}
                            </ul>
                        </div>
                        {Object.keys(this.state.trigger.usedTrigger.action).map((menu, indexUsedTrigger) => {
                            return (
                                <div
                                    key={indexUsedTrigger}
                                    className="Menu-list-card"
                                >
                                    <div
                                        className={
                                            this.state.trigger?.usedTrigger.nav[menu][0] == '-'
                                                ? 'menu-disabled'
                                                : 'menu-startside'
                                        }
                                    >
                                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                            <p className="noMargin inlineBlock strong">
                                                {this.state.trigger?.usedTrigger.nav[menu][0] == '-'
                                                    ? 'submenu'
                                                    : 'startSide'}
                                            </p>
                                            {this.props.userActiveCheckbox[menu] ? (
                                                <span className="textRight active"> {I18n.t('Active')}</span>
                                            ) : (
                                                <span className="textRight inactive"> {I18n.t('Inactive')}</span>
                                            )}
                                        </div>
                                        <p className="noMargin">
                                            {I18n.t('setMenu')}: {menu}
                                        </p>
                                    </div>
                                    <div
                                        className="User-list-container"
                                        style={{ border: `4px solid ${colors[this.getIndexOfMenu(menu)]}` }}
                                    >
                                        <p className="User-list">{I18n.t('userList')}</p>
                                        {this.props.usersInGroup[menu].map((user, indexUser) => {
                                            return <p key={indexUser}>{user}</p>;
                                        })}
                                    </div>

                                    <ul
                                        key={indexUsedTrigger}
                                        className="Action-list"
                                        style={{ paddingLeft: this.state.ulPadding[menu] }}
                                    >
                                        <li>
                                            <p className="strong">{I18n.t('navigationButtons')}</p>
                                            <ul className="createdTrigger">
                                                {this.state.trigger?.everyTrigger[menu].map((trigger, indexTrigger) => {
                                                    return (
                                                        <div
                                                            key={indexTrigger}
                                                            style={{ position: 'relative' }}
                                                        >
                                                            <Square
                                                                position={0}
                                                                color={
                                                                    this.getColorNavElemente(
                                                                        indexUsedTrigger,
                                                                        menu,
                                                                        trigger,
                                                                    ) || ''
                                                                }
                                                            />

                                                            <li
                                                                key={indexTrigger}
                                                                title={`${I18n.t('linkedWith')} ${this.getMenu()}`}
                                                            >
                                                                {trigger}
                                                            </li>
                                                        </div>
                                                    );
                                                })}
                                            </ul>
                                        </li>
                                        <li className="strong">{I18n.t('usedTrigger')}</li>
                                        <li>
                                            <p className="menuDescription">nav</p>
                                            <ul>
                                                {this.state.trigger?.usedTrigger.nav[menu].map(
                                                    (trigger, indexTrigger) => {
                                                        return (
                                                            <div
                                                                key={indexTrigger}
                                                                style={{ position: 'relative' }}
                                                            >
                                                                {this.getColorUsedTriggerNav({
                                                                    index: indexUsedTrigger,
                                                                    menuCall: menu,
                                                                    trigger,
                                                                })?.map((item, i) => (
                                                                    <Square
                                                                        key={i}
                                                                        position={i}
                                                                        color={item.color}
                                                                        trigger={trigger}
                                                                    />
                                                                ))}
                                                                <li
                                                                    className={
                                                                        indexTrigger == 0 && trigger == '-'
                                                                            ? 'menu-disabled'
                                                                            : indexTrigger == 0
                                                                              ? 'menu-startside'
                                                                              : ''
                                                                    }
                                                                    title={`${I18n.t(
                                                                        'linkedWith',
                                                                    )} ${this.menuArray.join(', ')}`}
                                                                >
                                                                    {trigger}
                                                                </li>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </ul>
                                        </li>

                                        {this.state.trigger?.usedTrigger.action[menu]
                                            ? Object.keys(this.state.trigger?.usedTrigger.action[menu]).map(
                                                  (action, index2) => {
                                                      return (
                                                          <li key={index2}>
                                                              <p className="menuDescription">{action}</p>
                                                              <ul>
                                                                  {(
                                                                      this.state.trigger?.usedTrigger.action[menu][
                                                                          action
                                                                      ] as string[]
                                                                  ).map((trigger, index3) => {
                                                                      return (
                                                                          <div
                                                                              key={index3}
                                                                              style={{ position: 'relative' }}
                                                                          >
                                                                              {this.getColorUsedTriggerNav({
                                                                                  index: indexUsedTrigger,
                                                                                  menuCall: menu,
                                                                                  trigger,
                                                                              })?.map((item, i) => (
                                                                                  <Square
                                                                                      key={i}
                                                                                      position={i}
                                                                                      color={item.color}
                                                                                  />
                                                                              ))}
                                                                              <li
                                                                                  key={index3}
                                                                                  title={`${I18n.t(
                                                                                      'linkedWith',
                                                                                  )} ${this.menuArray.join(', ')}`}
                                                                              >
                                                                                  {trigger}
                                                                              </li>
                                                                          </div>
                                                                      );
                                                                  })}
                                                              </ul>
                                                          </li>
                                                      );
                                                  },
                                              )
                                            : null}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </>
        );
    }
}

export default TriggerOverview;
