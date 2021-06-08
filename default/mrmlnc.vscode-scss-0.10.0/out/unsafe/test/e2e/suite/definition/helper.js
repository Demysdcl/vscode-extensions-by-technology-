"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDefinition = void 0;
const assert = require("assert");
const vscode = require("vscode");
const util_1 = require("../util");
async function testDefinition(docUri, position, expectedLocation) {
    await util_1.showFile(docUri);
    const result = (await vscode.commands.executeCommand('vscode.executeDefinitionProvider', docUri, position));
    if (result[0] === undefined) {
        assert.fail("The 'result[0]' is undefined.");
    }
    assert.ok(result[0].range.isEqual(expectedLocation.range));
    assert.strictEqual(result[0].uri.fsPath, expectedLocation.uri.fsPath);
}
exports.testDefinition = testDefinition;
