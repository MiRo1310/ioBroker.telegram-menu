import { describe, it } from 'mocha';
import { expect } from 'chai';
import { getInstances, getInstancesFromEventsById } from '../../src/app/events';
import type { MenusWithUsers, UserType } from '@/types/app';
import { Actions } from '../../src/types/types';
import { handleEvent } from '../../src/app/action';
import sinon from 'sinon';
import { mockAdapterCore } from '@iobroker/testing/build/tests/unit/mocks/mockAdapterCore';
import { utils } from '@iobroker/testing';

const userA: UserType = { instance: 'instanceA', name: 'User A', chatId: '1' };
const userB: UserType = { instance: 'instanceB', name: 'User B', chatId: '2' };
const userC: UserType = { instance: 'InstanceA', name: 'User C', chatId: '3' };

const menusWithUsers: MenusWithUsers = {
    menu1: [userA, userB],
    menu2: [userC],
};

describe('Events', () => {
    it('return all Users for existing Menu', () => {
        const result = getInstances(['menu1'], menusWithUsers);
        expect(result).to.deep.equal([userA, userB]);
    });

    it('return empty List if menu not exists', () => {
        const result = getInstances(['menuX'], menusWithUsers);
        expect(result).to.deep.equal([]);
    });

    it('return empty List if menuToGo is empty', () => {
        const result = getInstances([], menusWithUsers);
        expect(result).to.deep.equal([]);
    });

    it('return empty List if menuList is empty', () => {
        const result = getInstances(['menu1'], {} as MenusWithUsers);
        expect(result).to.deep.equal([]);
    });
});

describe('getInstancesFromEventsById', () => {
    it('should return correct users and isEvent true if event id matches', () => {
        const actions: Record<string, Actions> = {
            menu1: {
                events: [{ ID: ['event1'], ack: ['false'], menu: ['Test'], condition: ['123'] }],
            } as Actions,
        };

        const result = getInstancesFromEventsById(actions, 'event1', menusWithUsers);
        expect(result.isEvent).to.be.true;
        expect(result.eventInstanceList).to.deep.equal([userA, userB]);
    });

    it('should return isEvent false and empty list if no event id matches', () => {
        const actions: Record<string, Actions> = {
            menu1: {
                events: [{ ID: ['event1'], ack: ['false'], menu: ['Test'], condition: ['124'] }],
            } as Actions,
        };

        const result = getInstancesFromEventsById(actions, 'eventX', menusWithUsers);
        expect(result.isEvent).to.be.false;
        expect(result.eventInstanceList).to.deep.equal([]);
    });

    it('should handle undefined actions gracefully', () => {
        const result = getInstancesFromEventsById(undefined, 'event1', menusWithUsers);
        expect(result.isEvent).to.be.false;
        expect(result.eventInstanceList).to.deep.equal([]);
    });
});

describe('handleEvent', () => {
    it('should return false if dataObject.action is undefined', async () => {
        const result = await handleEvent(
            {} as any,
            'instance1',
            {} as any,
            'eventId',
            { ack: true, val: true } as any,
            {} as any,
            {} as any,
            {} as any,
        );
        expect(result).to.be.false;
    });

    it('should return false if no matching event is found', async () => {
        const dataObject = {
            action: {
                menu1: {
                    events: [{ ID: ['otherId'], ack: ['false'], condition: ['true'], menu: ['nav1'] }],
                },
            },
        };
        const result = await handleEvent(
            {} as any,
            'instance1',
            dataObject as any,
            'eventId',
            { ack: true, val: true } as any,
            {} as any,
            {} as any,
            {} as any,
        );
        expect(result).to.be.false;
    });

    const { adapter } = utils.unit.createMocks({});
    it('check state string', async () => {
        const dataObject = {
            action: {
                menu1: {
                    events: [{ ID: ['eventId'], ack: ['true'], condition: ['123'], menu: ['nav1'] }],
                },
            },
        };
        const menuData = {
            menu1: {
                nav1: {
                    nav: null,
                },
            },
        };
        const usersInGroup = {
            menu1: [{ name: 'user1' }],
        };

        const resultStringSame = await handleEvent(
            adapter,
            'instance1',
            dataObject as any,
            'eventId',
            { ack: true, val: '123' } as any,
            menuData as any,
            {} as any,
            usersInGroup as any,
        );
        expect(resultStringSame).to.be.true;

        const resultStringDifferent = await handleEvent(
            adapter,
            'instance1',
            dataObject as any,
            'eventId',
            { ack: true, val: '23' } as any,
            menuData as any,
            {} as any,
            usersInGroup as any,
        );
        expect(resultStringDifferent).to.be.false;
        const resultStringDifferent2 = await handleEvent(
            adapter,
            'instance1',
            dataObject as any,
            'eventId',
            { ack: true, val: 'true' } as any,
            menuData as any,
            {} as any,
            usersInGroup as any,
        );
        expect(resultStringDifferent2).to.be.false;
    });

    it('check State boolean', async () => {
        const dataObject = {
            action: {
                menu1: {
                    events: [{ ID: ['eventId'], ack: ['true'], condition: ['true'], menu: ['nav1'] }],
                },
            },
        };
        const menuData = {
            menu1: {
                nav1: {
                    nav: null,
                },
            },
        };
        const usersInGroup = {
            menu1: [{ name: 'user1' }],
        };
        const resultBooleanTrueSame = await handleEvent(
            adapter,
            'instance1',
            dataObject as any,
            'eventId',
            { ack: true, val: true } as any,
            menuData as any,
            {} as any,
            usersInGroup as any,
        );
        expect(resultBooleanTrueSame).to.be.true;

        const resultBooleanFalse = await handleEvent(
            adapter,
            'instance1',
            dataObject as any,
            'eventId',
            { ack: true, val: 1 } as any,
            menuData as any,
            {} as any,
            usersInGroup as any,
        );
        expect(resultBooleanFalse).to.be.false;
        const dataObject2 = {
            action: {
                menu1: {
                    events: [{ ID: ['eventId'], ack: ['true'], condition: ['false'], menu: ['nav1'] }],
                },
            },
        };
        const resultBooleanFalse2 = await handleEvent(
            adapter,
            'instance1',
            dataObject2 as any,
            'eventId',
            { ack: true, val: false } as any,
            menuData as any,
            {} as any,
            usersInGroup as any,
        );
        expect(resultBooleanFalse2).to.be.false;
    });
});
