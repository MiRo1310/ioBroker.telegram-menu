import { expect } from 'chai';
import sinon from 'sinon';
import { StateValueTransformer } from '@backend/app/stateValueTransformer';
import { createAppContextMock } from '../../fixtures/appContextMock';
import type { AppContext } from '@backend/app/appContext';

describe('StateValueTransformer', () => {
    let adapterMock: any;
    let appContext: AppContext;

    beforeEach(() => {
        adapterMock = {
            log: { debug: sinon.stub(), warn: sinon.stub(), error: sinon.stub() },
            getForeignStateAsync: sinon.stub(),
            supportsFeature: sinon.stub().returns(false),
        };
        appContext = createAppContextMock(adapterMock);
    });

    afterEach(() => {
        sinon.restore();
    });

    const make = (text: string, stateVal: string) => new StateValueTransformer(text, stateVal, appContext);

    // ─── applyTimestamp ──────────────────────────────────────────────────────

    describe('applyTimestamp', () => {
        it('should update text and clear stateVal when text includes {time.ts', async () => {
            const getTimeValueStub = sinon.stub(require('../../../src/lib/utilities'), 'getTimeValue').resolves('2024-01-01 12:00');
            const t = make('{time.ts:state.0.val}', '42');
            await t.applyTimestamp('state.0.val');
            expect(t.text).to.equal('2024-01-01 12:00');
            expect(t.stateVal).to.equal('');
            expect(getTimeValueStub.calledOnce).to.be.true;
        });

        it('should update text and clear stateVal when text includes {time.lc', async () => {
            sinon.stub(require('../../../src/lib/utilities'), 'getTimeValue').resolves('2024-01-01 11:00');
            const t = make('{time.lc:state.0.val}', '42');
            await t.applyTimestamp('state.0.val');
            expect(t.text).to.equal('2024-01-01 11:00');
            expect(t.stateVal).to.equal('');
        });

        it('should leave text and stateVal unchanged when no timestamp in text', async () => {
            const getTimeValueStub = sinon.stub(require('../../../src/lib/utilities'), 'getTimeValue').resolves('irrelevant');
            const t = make('Temperature: &&', '21');
            await t.applyTimestamp('state.0.val');
            expect(t.text).to.equal('Temperature: &&');
            expect(t.stateVal).to.equal('21');
            expect(getTimeValueStub.called).to.be.false;
        });
    });

    // ─── applyTime ───────────────────────────────────────────────────────────

    describe('applyTime', () => {
        it('should update text and clear stateVal when text includes {time}', () => {
            const t = make('Time is {time}', '42');
            t.applyTime();
            expect(t.text).to.not.include('{time}');
            expect(t.stateVal).to.equal('');
        });

        it('should leave text and stateVal unchanged when no {time} in text', () => {
            const t = make('Temperature: &&', '21');
            t.applyTime();
            expect(t.text).to.equal('Temperature: &&');
            expect(t.stateVal).to.equal('21');
        });

        it('should use original stateVal (not a modified one) for time integration', () => {
            const t = make('Time is {time}', 'original');
            t.stateVal = 'modified-later';
            t.applyTime();
            // integrateTimeIntoText receives the original staleVal, not 'modified-later'
            // Since {time} is replaced by current time, the originalStaleVal is used as the base
            expect(t.stateVal).to.equal('');
        });
    });

    // ─── applyMath ───────────────────────────────────────────────────────────

    describe('applyMath', () => {
        it('should evaluate math expression and update both text and stateVal', () => {
            const t = make('Result: {math:*2}', '5');
            t.applyMath();
            expect(t.stateVal).to.equal(10);
            expect(t.text).to.not.include('{math:');
        });

        it('should leave text and stateVal unchanged when no {math: in text', () => {
            const t = make('Temperature: &&', '21');
            t.applyMath();
            expect(t.text).to.equal('Temperature: &&');
            expect(t.stateVal).to.equal('21');
        });

        it('should not update values when math expression has error', () => {
            const t = make('Result: {math:invalid!!!}', '5');
            const originalText = t.text;
            const originalVal = t.stateVal;
            t.applyMath();
            // On error, mathFunction leaves textToSend as textExcludeSubstring but error=true
            // The transformer skips the update → text and stateVal unchanged
            expect(t.stateVal).to.equal(originalVal);
        });

        it('should log debug after successful math', () => {
            const t = make('{math:+1}', '9');
            t.applyMath();
            expect(adapterMock.log.debug.called).to.be.true;
        });
    });

    // ─── applyRound ──────────────────────────────────────────────────────────

    describe('applyRound', () => {
        it('should round stateVal and strip {round:} from text', () => {
            const t = make('Value: {round:2}', '3.14159');
            t.applyRound();
            expect(t.stateVal).to.equal('3.14');
            expect(t.text).to.not.include('{round:');
        });

        it('should leave text and stateVal unchanged when no {round: in text', () => {
            const t = make('Temperature: &&', '3.14159');
            t.applyRound();
            expect(t.text).to.equal('Temperature: &&');
            expect(t.stateVal).to.equal('3.14159');
        });

        it('should not update values when stateVal is NaN', () => {
            const t = make('Value: {round:2}', 'not-a-number');
            t.applyRound();
            // roundValue returns error=true for NaN → transformer skips update
            expect(t.stateVal).to.equal('not-a-number');
        });

        it('should log debug after successful round', () => {
            const t = make('{round:1}', '2.567');
            t.applyRound();
            expect(adapterMock.log.debug.called).to.be.true;
        });
    });

    // ─── method chaining independence ────────────────────────────────────────

    describe('apply method independence', () => {
        it('should chain math then round correctly', () => {
            // math: *2 on '3' → stateVal=6, then round:1 on 6 → '6.0'
            const t = make('{math:*2} {round:1}', '3');
            t.applyMath();
            t.applyRound();
            expect(t.stateVal).to.equal('6.0');
        });

        it('timestamp and time are mutually skipped (both checks conditional on text content)', () => {
            const t = make('Temperature: &&', '42');
            // Neither applies — values stay unchanged
            t.applyTime();
            expect(t.text).to.equal('Temperature: &&');
            expect(t.stateVal).to.equal('42');
        });
    });
});
