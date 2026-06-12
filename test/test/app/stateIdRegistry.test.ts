import { expect } from 'chai';
import sinon from 'sinon';
import { StateIdRegistry } from '@backend/app/stateIdRegistry';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';
import type { SetStateIds } from '@backend/types/types';

describe('StateIdRegistry', () => {
    let adapterMock: any;
    let appContext: AppContext;
    let registry: StateIdRegistry;

    const makeEntry = (overrides: Partial<SetStateIds> = {}): SetStateIds => ({
        id: 'test.0.state',
        userToSend: 'Alice',
        confirm: true,
        returnText: 'Done',
        parse_mode: false,
        instance: 'telegram.0',
        ...overrides,
    });

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            subscribeForeignStatesAsync: sinon.stub().resolves(),
        };
        appContext = createAppContextMock(adapterMock);
        registry = new StateIdRegistry(appContext);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should add an ID and subscribe to it', async () => {
        await registry.addIds(adapterMock, makeEntry());
        expect(registry.getIds()).to.have.lengthOf(1);
        expect(adapterMock.subscribeForeignStatesAsync.calledOnce).to.be.true;
    });

    it('should skip duplicate ID and log debug', async () => {
        const entry = makeEntry();
        await registry.addIds(adapterMock, entry);
        await registry.addIds(adapterMock, entry);
        expect(registry.getIds()).to.have.lengthOf(1);
        expect(adapterMock.log.debug.called).to.be.true;
        expect(adapterMock.subscribeForeignStatesAsync.calledOnce).to.be.true;
    });

    it('should allow adding different IDs', async () => {
        await registry.addIds(adapterMock, makeEntry({ id: 'test.0.a' }));
        await registry.addIds(adapterMock, makeEntry({ id: 'test.0.b' }));
        expect(registry.getIds()).to.have.lengthOf(2);
        expect(adapterMock.subscribeForeignStatesAsync.calledTwice).to.be.true;
    });

    it('setStateIdsToIdArray should return array of id strings', () => {
        const ids = [makeEntry({ id: 'a.b.c' }), makeEntry({ id: 'd.e.f' })];
        const result = StateIdRegistry.setStateIdsToIdArray(ids);
        expect(result).to.deep.equal(['a.b.c', 'd.e.f']);
    });
});
