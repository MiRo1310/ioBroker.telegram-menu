import { regexIdText } from '@b/app/deprecated';
import { expect } from 'chai';

describe('Regex', () => {
    it('should return true', async () => {
        const text = "{'id':'adapter.0.example', 'text':'Text'}";

        expect(regexIdText.test(text)).to.be.true;
    });

    it('should return true, with additional text', async () => {
        const text = "Test {'id':'adapter.0.example', 'text':'Text'}";

        expect(regexIdText.test(text)).to.be.true;
    });
});
