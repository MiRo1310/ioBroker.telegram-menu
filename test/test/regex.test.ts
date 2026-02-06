import { regexIdText } from '@b/app/deprecated';
import { expect } from 'chai';

describe('Regex', () => {
    it('should return correct value with regex', async () => {
        const text = "{'id':'adapter.0.example', 'text':'Text'}";

        expect(regexIdText.test(text)).to.be.true;
    });

    it('should return correct value with regex', async () => {
        const text = "Test {'id':'adapter.0.example', 'text':'Text'}";

        expect(regexIdText.test(text)).to.be.true;
    });
});
