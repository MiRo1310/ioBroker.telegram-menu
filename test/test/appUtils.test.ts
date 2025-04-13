import {checkOneLineValue} from "../../src/lib/appUtils";
import {expect} from "chai";

describe("checkOneLineValue", () => {
    it("should add a row splitter to the end of the text if it doesn't already contain one", () => {
        const result = checkOneLineValue("Hello this is a test");
        expect(result).to.equal("Hello this is a test &&");
    });

    it("should not add a row splitter if the text already contains one", () => {
        const result = checkOneLineValue("Hello this is a test &&");
        expect(result).to.equal("Hello this is a test &&");
    });
})