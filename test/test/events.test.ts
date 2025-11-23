import { describe, it } from 'mocha';
import { expect } from 'chai';
import { checkCondition, getInstances, getInstancesFromEventsById, handleEvent, toBoolean } from '@b/app/events';
import type { EventAction, MenusWithUsers, UserType } from '@/types/app';
import { Adapter, Actions, MenuData } from '@b/types/types';
import { utils } from '@iobroker/testing';
import sinon from 'sinon';

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
        expect(result.eventUserList).to.deep.equal([userA, userB]);
    });

    it('should return isEvent false and empty list if no event id matches', () => {
        const actions: Record<string, Actions> = {
            menu1: {
                events: [{ ID: ['event1'], ack: ['false'], menu: ['Test'], condition: ['124'] }],
            } as Actions,
        };

        const result = getInstancesFromEventsById(actions, 'eventX', menusWithUsers);
        expect(result.isEvent).to.be.false;
        expect(result.eventUserList).to.deep.equal([]);
    });

    it('should handle undefined actions gracefully', () => {
        const result = getInstancesFromEventsById(undefined, 'event1', menusWithUsers);
        expect(result.isEvent).to.be.false;
        expect(result.eventUserList).to.deep.equal([]);
    });
});

describe('handleEvent', () => {
    it('should return false if dataObject.action is undefined', async () => {
        const result = await handleEvent(
            {} as any,
            userA,
            {} as any,
            'eventId',
            { ack: true, val: true } as any,
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
            userA,
            dataObject as any,
            'eventId',
            { ack: true, val: true } as any,
            {} as any,
            {} as any,
        );
        expect(result).to.be.false;
    });

    const { adapter } = utils.unit.createMocks({});
    const mockAdapter = adapter as unknown as Adapter;

    it('check state string', async () => {
        const dataObject = {
            nav: {
                Menu: [
                    {
                        call: 'Übersicht',
                        value: 'Übersicht , Light , Grafana , Weather , Test',
                        text: 'chooseAction',
                        parse_mode: 'false',
                    },
                    {
                        call: 'Test',
                        value: 'Übersicht',
                        text: 'chooseAction',
                        parse_mode: 'false',
                    },
                ],
            },
            action: {
                Menu: {
                    get: [],
                    set: [],
                    pic: [],
                    echarts: [],
                    events: [
                        {
                            ID: ['eventId'],
                            menu: ['Test'],
                            condition: ['123'],
                            ack: ['false'],
                        },
                    ],
                    httpRequest: [],
                },
            },
        };
        const menuData: MenuData = {
            Menu: {
                Test: {
                    nav: [['Menu1']],
                },
            },
        };

        const resultStringDifferent = await handleEvent(
            mockAdapter,
            userA,
            dataObject as any,
            'eventId',
            { ack: true, val: '23' } as any,
            menuData,
            {} as any,
        );
        expect(resultStringDifferent).to.be.false;
        const resultStringDifferent2 = await handleEvent(
            mockAdapter,
            userA,
            dataObject as any,
            'eventId',
            { ack: true, val: 'true' } as any,
            menuData as any,
            {} as any,
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

        const resultBooleanTrueSame = await handleEvent(
            mockAdapter,
            userA,
            dataObject as any,
            'eventId',
            { ack: true, val: true } as any,
            menuData as any,
            {} as any,
        );
        expect(resultBooleanTrueSame).to.be.true;

        const resultBooleanFalse = await handleEvent(
            mockAdapter,
            userA,
            dataObject as any,
            'eventId',
            { ack: true, val: 1 } as any,
            menuData as any,
            {} as any,
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
            mockAdapter,
            userA,
            dataObject2 as any,
            'eventId',
            { ack: true, val: false } as any,
            menuData as any,
            {} as any,
        );
        expect(resultBooleanFalse2).to.be.true;
    });
});

describe('Event params', () => {
    const { adapter } = utils.unit.createMocks({});
    const mockAdapter = adapter as unknown as Adapter;
    let sendNavStub: sinon.SinonStub;
    const dataObject = {
        nav: {
            Menu: [
                {
                    call: 'Übersicht',
                    value: 'Übersicht , Light , Grafana , Weather , Test',
                    text: 'chooseAction',
                    parse_mode: 'false',
                },
                {
                    call: 'Test',
                    value: 'Übersicht',
                    text: 'chooseAction',
                    parse_mode: 'false',
                },
            ],
        },
        action: {
            Menu: {
                get: [],
                set: [],
                pic: [],
                echarts: [],
                events: [
                    {
                        ID: ['eventId'],
                        menu: ['Test'],
                        condition: ['123'],
                        ack: ['false'],
                    },
                ],
                httpRequest: [],
            },
        },
    };
    const menuData: MenuData = {
        Menu: {
            Test: {
                nav: [['Menu1']],
            },
        },
    };
    beforeEach(() => {
        sinon.restore();
        sendNavStub = sinon.stub(require('../../src/app/sendNav'), 'sendNav');
    });
    it('should send one user', async () => {
        const resultStringSame = await handleEvent(
            mockAdapter,
            userA,
            dataObject as any,
            'eventId',
            { ack: false, val: '123' } as any,
            menuData,
            {} as any,
        );

        expect(resultStringSame).to.be.true;
        expect(sendNavStub.calledOnce).to.be.true;
        expect(sendNavStub.args[0][1]).to.deep.equal('instanceA');
        expect(sendNavStub.args[0][2]).to.deep.equal(menuData['Menu']['Test']);
        expect(sendNavStub.args[0][3]).to.deep.equal('User A');
    });

    it('should send userB', async () => {
        const resultStringSame2 = await handleEvent(
            mockAdapter,
            userB,
            dataObject as any,
            'eventId',
            { ack: false, val: '123' } as any,
            menuData,
            {} as any,
        );

        expect(resultStringSame2).to.be.true;
        expect(sendNavStub.callCount).to.be.equal(1);
        expect(sendNavStub.args[0][1]).to.deep.equal('instanceB');
        expect(sendNavStub.args[0][2]).to.deep.equal(menuData['Menu']['Test']);
        expect(sendNavStub.args[0][3]).to.deep.equal('User B');
    });
});

describe('to boolean', () => {
    it('should be true if insert true', () => {
        expect(toBoolean('true')).to.be.true;
    });

    it('should be false if insert false', () => {
        expect(toBoolean('true')).to.be.true;
    });

    it('should be null if insert empty string', () => {
        expect(toBoolean('')).to.be.null;
    });

    it('should be null if insert non boolean string', () => {
        expect(toBoolean('abc')).to.be.null;
    });

    it('should be null if insert non boolean string', () => {
        expect(toBoolean('1')).to.be.null;
    });
});

describe('checkCondition', () => {
    const { adapter } = utils.unit.createMocks({});
    const mockAdapter = adapter as unknown as Adapter;
    it('should be true with boolean true', () => {
        expect(checkCondition(mockAdapter, true, { conditionFilter: ['='], condition: ['true'] } as EventAction)).to.be
            .true;
    });

    it('should be true with boolean false', () => {
        expect(checkCondition(mockAdapter, false, { conditionFilter: ['='], condition: ['false'] } as EventAction)).to
            .be.true;
    });

    it('should be true with boolean false', () => {
        expect(checkCondition(mockAdapter, false, { conditionFilter: ['!='], condition: ['true'] } as EventAction)).to
            .be.true;
    });

    it('should be true with same string', () => {
        expect(checkCondition(mockAdapter, '123', { conditionFilter: ['='], condition: ['123'] } as EventAction)).to.be
            .true;
    });

    it('should be false with diffenrent string', () => {
        expect(checkCondition(mockAdapter, '1234', { conditionFilter: ['='], condition: ['123'] } as EventAction)).to.be
            .false;
    });

    it('should be false with same string and not equal', () => {
        expect(checkCondition(mockAdapter, '123', { conditionFilter: ['!='], condition: ['123'] } as EventAction)).to.be
            .false;
    });

    it('should be true with same number', () => {
        expect(checkCondition(mockAdapter, 123, { conditionFilter: ['='], condition: ['123'] } as EventAction)).to.be
            .true;
    });

    it('should be true with float number and greater than', () => {
        expect(checkCondition(mockAdapter, 14.2, { conditionFilter: ['>'], condition: ['12.3'] } as EventAction)).to.be
            .true;
    });

    it('should be false with float number and greater than', () => {
        expect(checkCondition(mockAdapter, 10.2, { conditionFilter: ['>'], condition: ['12.3'] } as EventAction)).to.be
            .false;
    });

    it('should be false with int number and smaller than', () => {
        expect(checkCondition(mockAdapter, 14, { conditionFilter: ['<'], condition: ['12'] } as EventAction)).to.be
            .false;
    });

    it('should be true with float number', () => {
        expect(checkCondition(mockAdapter, 14, { conditionFilter: ['<='], condition: ['14'] } as EventAction)).to.be
            .true;
    });

    it('should be false with float number', () => {
        expect(checkCondition(mockAdapter, 15, { conditionFilter: ['<='], condition: ['14'] } as EventAction)).to.be
            .false;
    });

    it('should be true with string and wrong filter', () => {
        expect(checkCondition(mockAdapter, 'Test', { conditionFilter: ['<='], condition: ['Test'] } as EventAction)).to
            .be.true;
    });

    it('should be false with string and wrong filter', () => {
        expect(checkCondition(mockAdapter, 'Test 123', { conditionFilter: ['<='], condition: ['Test'] } as EventAction))
            .to.be.false;
    });
});
