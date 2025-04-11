import {decomposeText, jsonString, parseJSON, replaceAll, validateNewLine} from "../../src/lib/string";
import {expect} from "chai";

describe("String", () => {

    it("jsonString", () => {
        const result = jsonString({ test: "test" });
        expect(result).to.equal('{"test":"test"}');
    })

    it("parseJSON with json", () => {
        const result = parseJSON<Record<string, number>>('{"test":123}')
        expect(result).to.deep.equal({isValidJson: true, json: {test:123} });
    })

    it("parseJSON with incorrect json", () => {
        const result = parseJSON("test")
        expect(result).to.deep.equal({isValidJson: false, json: "test" });
    })

    it("Replace all", () => {
        const texts =[{val:"Test", expect:"Test"},{
            val:"Abc. Def. Ghi.//.", expect: "Abc  Def  Ghi //"
        }];

        texts.forEach(text => {
        const result = replaceAll(text.val, ".", " ");
        expect(result).to.equal(text.expect);
        })
    })

    it("Validate new line", () => {
        const result = validateNewLine("Das hier ist ein\\n Test");
        expect(result).to.equal("Das hier ist ein\n Test");
    })

    describe('validateNewLine', () => {
        it('soll \\n in echten Zeilenumbruch umwandeln', () => {
            const input = 'Das\\\\\n hier\\\\n ist ein\\\n Test';
            const expected = 'Das\n hier\n ist ein\n Test';
            const result = validateNewLine(input);

            expect(result).to.equal( expected);
        });
    });

    it("Decompose text", () => {
        const result = decomposeText("Das ist ein __Test. Das ist ein Test2", "__", ".");
        expect(result).to.deep.equal({startindex: 12, endindex: 18, substring: "__Test.", textWithoutSubstring: "Das ist ein  Das ist ein Test2" });

        const result2 = decomposeText("Das ist ein __Test.", "?", ".");
        expect(result2).to.deep.equal({startindex: -1, endindex: 18, substring: "Das ist ein __Test.", textWithoutSubstring: "" });

        const result3 = decomposeText("Das ist ein __Test.", "?", "-");
        expect(result3).to.deep.equal({startindex: -1, endindex: -1, substring: "", textWithoutSubstring: "Das ist ein __Test." });
    })

})