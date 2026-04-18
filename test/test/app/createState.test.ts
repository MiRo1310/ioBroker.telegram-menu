import { expect } from 'chai';
import sinon from 'sinon';
import { createState } from '../../../src/app/createState';

describe('createState', () => {
    it('should call setObjectNotExistsAsync with correct parameters', async () => {
        const adapterMock: any = {
            setObjectNotExistsAsync: sinon.stub().resolves(),
        };
        await createState(adapterMock);
        expect(adapterMock.setObjectNotExistsAsync.calledOnce).to.be.true;
        const args = adapterMock.setObjectNotExistsAsync.firstCall.args;
        expect(args[0]).to.equal('communication.requestIds');
        expect(args[1].type).to.equal('state');
        expect(args[1].common.name).to.equal('RequestIds');
        expect(args[1].common.type).to.equal('string');
    });
});

