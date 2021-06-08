"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testHover = void 0;
const assert = require("assert");
const vscode = require("vscode");
const util_1 = require("../util");
async function testHover(docUri, position, expectedHover) {
    await util_1.showFile(docUri);
    const result = (await vscode.commands.executeCommand('vscode.executeHoverProvider', docUri, position));
    if (!result[0]) {
        throw Error('Hover failed');
    }
    const contents = result
        .map(item => {
        return item.contents.map((content) => content.value);
    })
        .join('\n');
    // We use `.includes` here because the hover can contain content from other plugins.
    assert.ok(contents.includes(expectedHover.contents.join('')));
    if (expectedHover.range && result[0] && result[0].range) {
        assert.ok(result[0].range.isEqual(expectedHover.range));
    }
}
exports.testHover = testHover;
