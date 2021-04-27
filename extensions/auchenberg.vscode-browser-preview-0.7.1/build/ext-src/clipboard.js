"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class Clipboard {
    writeText(value) {
        return vscode_1.env.clipboard.writeText(value);
    }
    readText() {
        return vscode_1.env.clipboard.readText();
    }
}
exports.default = Clipboard;
//# sourceMappingURL=clipboard.js.map