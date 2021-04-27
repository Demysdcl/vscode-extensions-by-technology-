// Original source: https://github.com/Microsoft/vscode/blob/master/extensions/html-language-features/client/src/tagClosing.ts
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTagClosing = void 0;
const vscode_1 = require("vscode");
function activateTagClosing(tagProvider, supportedLanguages, configName) {
    const disposables = [];
    vscode_1.workspace.onDidChangeTextDocument((event) => onDidChangeTextDocument(event.document, event.contentChanges), null, disposables);
    let isEnabled = false;
    updateEnabledState();
    vscode_1.window.onDidChangeActiveTextEditor(updateEnabledState, null, disposables);
    let timeout = void 0;
    function updateEnabledState() {
        isEnabled = false;
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const document = editor.document;
        if (!supportedLanguages[document.languageId]) {
            return;
        }
        if (!vscode_1.workspace.getConfiguration(void 0, document.uri).get(configName)) {
            return;
        }
        isEnabled = true;
    }
    function onDidChangeTextDocument(document, changes) {
        var _a;
        if (!isEnabled) {
            return;
        }
        const activeDocument = vscode_1.window.activeTextEditor && vscode_1.window.activeTextEditor.document;
        if (document !== activeDocument || changes.length === 0) {
            return;
        }
        if (typeof timeout !== 'undefined') {
            clearTimeout(timeout);
        }
        const lastChange = changes[changes.length - 1];
        const lastCharacter = lastChange.text[lastChange.text.length - 1];
        if (('range' in lastChange && ((_a = lastChange.rangeLength) !== null && _a !== void 0 ? _a : 0) > 0) ||
            (lastCharacter !== '>' && lastCharacter !== '/')) {
            return;
        }
        const rangeStart = 'range' in lastChange
            ? lastChange.range.start
            : new vscode_1.Position(0, document.getText().length);
        const version = document.version;
        timeout = setTimeout(() => {
            const position = new vscode_1.Position(rangeStart.line, rangeStart.character + lastChange.text.length);
            tagProvider(document, position).then((text) => {
                if (text && isEnabled) {
                    const activeEditor = vscode_1.window.activeTextEditor;
                    if (activeEditor) {
                        const activeDocument = activeEditor.document;
                        if (document === activeDocument && activeDocument.version === version) {
                            const selections = activeEditor.selections;
                            if (selections.length &&
                                selections.some((s) => s.active.isEqual(position))) {
                                activeEditor.insertSnippet(new vscode_1.SnippetString(text), selections.map((s) => s.active));
                            }
                            else {
                                activeEditor.insertSnippet(new vscode_1.SnippetString(text), position);
                            }
                        }
                    }
                }
            });
            timeout = void 0;
        }, 100);
    }
    return vscode_1.Disposable.from(...disposables);
}
exports.activateTagClosing = activateTagClosing;
//# sourceMappingURL=autoClose.js.map