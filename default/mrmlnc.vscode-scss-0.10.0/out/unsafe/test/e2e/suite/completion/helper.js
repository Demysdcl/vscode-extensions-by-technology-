"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testCompletion = void 0;
const assert = require("assert");
const vscode = require("vscode");
const util_1 = require("../util");
async function testCompletion(docUri, position, expectedItems) {
    await util_1.showFile(docUri);
    const result = (await vscode.commands.executeCommand('vscode.executeCompletionItemProvider', docUri, position));
    expectedItems.forEach(ei => {
        if (typeof ei === 'string') {
            assert.ok(result.items.some(i => {
                return i.label === ei;
            }));
        }
        else {
            const match = result.items.find(i => i.label === ei.label);
            if (!match) {
                assert.fail(`Can't find matching item for ${JSON.stringify(ei, null, 2)}`);
                return;
            }
            assert.strictEqual(match.label, ei.label);
            if (ei.kind) {
                assert.strictEqual(match.kind, ei.kind);
            }
            if (ei.detail) {
                assert.strictEqual(match.detail, ei.detail);
            }
            if (ei.documentation) {
                if (typeof match.documentation === 'string') {
                    assert.strictEqual(match.documentation, ei.documentation);
                }
                else {
                    if (ei.documentation && ei.documentation.value && match.documentation) {
                        assert.strictEqual(match.documentation.value, ei.documentation.value);
                    }
                }
            }
        }
    });
}
exports.testCompletion = testCompletion;
