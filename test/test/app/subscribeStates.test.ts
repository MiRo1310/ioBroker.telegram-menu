import { expect } from 'chai';
import sinon from 'sinon';
import { _subscribeForeignStates } from '@backend/app/subscribeStates';

describe('subscribeStates', () => {
    let adapterMock: any;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub() },
            subscribeForeignStatesAsync: sinon.stub().resolves(),
        };
    });

    it('should subscribe to a single string id', async () => {
        await _subscribeForeignStates(adapterMock, 'state.0.test');
        expect(adapterMock.subscribeForeignStatesAsync.calledOnceWith('state.0.test')).to.be.true;
    });

    it('should subscribe to all ids in an array', async () => {
        await _subscribeForeignStates(adapterMock, ['state.0.a', 'state.0.b', 'state.0.a']);
        // deduplicated: only 2 unique ids
        expect(adapterMock.subscribeForeignStatesAsync.callCount).to.equal(2);
    });

    it('should deduplicate array entries', async () => {
        await _subscribeForeignStates(adapterMock, ['state.0.x', 'state.0.x']);
        expect(adapterMock.subscribeForeignStatesAsync.callCount).to.equal(1);
    });
});
