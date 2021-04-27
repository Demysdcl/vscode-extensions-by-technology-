"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class TargetTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        vscode.commands.executeCommand('browser-preview.openPreview');
        vscode.commands.executeCommand('workbench.view.explorer');
        this._onDidChangeTreeData.fire(); // Make sure collection is not cached.
        return Promise.reject([]);
    }
}
exports.default = TargetTreeProvider;
//# sourceMappingURL=targetTreeProvider.js.map