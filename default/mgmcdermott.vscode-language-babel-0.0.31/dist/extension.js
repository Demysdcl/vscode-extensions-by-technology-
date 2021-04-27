"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const wordPattern = /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g;
exports.jsxConfiguration = {
    wordPattern,
    onEnterRules: [
        {
            beforeText: /.*/,
            afterText: /\/>/,
            action: { indentAction: vscode_1.IndentAction.IndentOutdent },
        },
    ],
};
exports.jsxAttrConfiguration = {
    wordPattern,
    onEnterRules: [
        {
            beforeText: />/,
            afterText: /<\//,
            action: { indentAction: vscode_1.IndentAction.IndentOutdent },
        },
    ],
};
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        vscode_1.languages.setLanguageConfiguration('jsx', exports.jsxConfiguration);
        vscode_1.languages.setLanguageConfiguration('jsx-attr', exports.jsxAttrConfiguration);
    });
}
exports.activate = activate;
