"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSignature = void 0;
const assert = require("assert");
const vscode = require("vscode");
const util_1 = require("../util");
async function testSignature(docUri, position, signature) {
    await util_1.showFile(docUri);
    const result = await vscode.commands.executeCommand('vscode.executeSignatureHelpProvider', docUri, position);
    if (result === undefined) {
        assert.fail("The 'result' is undefined.");
    }
    assert.strictEqual(result.activeParameter, signature.activeParameter, 'activeParameter');
    assert.strictEqual(result.activeSignature, signature.activeSignature, 'activeSignature');
    assert.strictEqual(result.signatures.length, signature.signatures.length, `Count of signatures: ${signature.signatures.length} expected; ${result.signatures.length} actual`);
    signature.signatures.forEach((expectedSignature, i) => {
        const actualSignature = result.signatures[i];
        if (actualSignature === undefined) {
            assert.fail("The 'actualSignature' is undefined.");
        }
        assert.strictEqual(actualSignature.label, expectedSignature.label);
        assert.strictEqual(actualSignature.parameters.length, expectedSignature.parameters.length, `Count of parameters for {expectedSignature.label}: ${expectedSignature.parameters.length} expected; ${actualSignature.parameters.length} actual`);
    });
}
exports.testSignature = testSignature;
