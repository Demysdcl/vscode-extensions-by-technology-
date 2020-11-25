"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetEndOfLine = void 0;
const vscode_1 = require("vscode");
const PreSaveTransformation_1 = require("./PreSaveTransformation");
const eolMap = {
    LF: vscode_1.EndOfLine.LF,
    CRLF: vscode_1.EndOfLine.CRLF,
};
/**
 * Sets the end of line, but only when there is a reason to do so.
 * This is to preserve redo history when possible.
 */
class SetEndOfLine extends PreSaveTransformation_1.PreSaveTransformation {
    constructor() {
        super(...arguments);
        this.eolMap = eolMap;
    }
    transform(editorconfigProperties, doc) {
        const eolKey = (editorconfigProperties.end_of_line || '').toUpperCase();
        const eol = this.eolMap[eolKey];
        if (!eol) {
            return noEdits();
        }
        const text = doc.getText();
        switch (eol) {
            case vscode_1.EndOfLine.LF:
                if (/\r\n/.test(text)) {
                    return createEdits();
                }
                break;
            case vscode_1.EndOfLine.CRLF:
                // if there is an LF not preceded by a CR
                if (/(?<!\r)\n/.test(text)) {
                    return createEdits();
                }
                break;
        }
        return noEdits();
        function noEdits() {
            return { edits: [] };
        }
        /**
         * @warning destroys redo history
         */
        function createEdits() {
            return {
                edits: [vscode_1.TextEdit.setEndOfLine(eol)],
                message: `setEndOfLine(${eolKey})`,
            };
        }
    }
}
exports.SetEndOfLine = SetEndOfLine;
//# sourceMappingURL=SetEndOfLine.js.map