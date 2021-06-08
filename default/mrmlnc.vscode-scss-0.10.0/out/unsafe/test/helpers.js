"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMarkupContentForScssLanguage = exports.makeSettings = exports.makeSameLineRange = exports.makeAst = exports.makeDocument = void 0;
const path = require("path");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_css_languageservice_1 = require("vscode-css-languageservice");
const vscode_uri_1 = require("vscode-uri");
const ls = vscode_css_languageservice_1.getSCSSLanguageService();
ls.configure({
    validate: false
});
function makeDocument(lines, options = {}) {
    return vscode_languageserver_textdocument_1.TextDocument.create(options.uri || vscode_uri_1.URI.file(path.join(process.cwd(), 'index.scss')).toString(), options.languageId || 'scss', options.version || 1, Array.isArray(lines) ? lines.join('\n') : lines);
}
exports.makeDocument = makeDocument;
function makeAst(lines) {
    const document = makeDocument(lines);
    return ls.parseStylesheet(document);
}
exports.makeAst = makeAst;
function makeSameLineRange(line = 1, start = 1, end = 1) {
    return vscode_css_languageservice_1.Range.create(vscode_css_languageservice_1.Position.create(line, start), vscode_css_languageservice_1.Position.create(line, end));
}
exports.makeSameLineRange = makeSameLineRange;
function makeSettings(options) {
    return Object.assign({ scannerDepth: 30, scannerExclude: ['**/.git', '**/node_modules', '**/bower_components'], scanImportedFiles: true, implicitlyLabel: '(implicitly)', showErrors: false, suggestVariables: true, suggestMixins: true, suggestFunctions: true, suggestFunctionsInStringContextAfterSymbols: ' (+-*%' }, options);
}
exports.makeSettings = makeSettings;
function makeMarkupContentForScssLanguage(content) {
    return {
        kind: vscode_css_languageservice_1.MarkupKind.Markdown,
        value: ['```scss', content, '```'].join('\n')
    };
}
exports.makeMarkupContentForScssLanguage = makeMarkupContentForScssLanguage;
