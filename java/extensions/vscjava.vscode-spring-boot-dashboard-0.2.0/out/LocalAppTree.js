"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class BootAppItem {
    constructor(app) {
        this._app = app;
    }
    get label() {
        return this._app.name;
    }
    get iconPath() {
        const color = this.state === "running" ? new vscode.ThemeColor("charts.green") : undefined;
        return new vscode.ThemeIcon("circle-filled", color);
    }
    get state() {
        return this._app.state;
    }
    get contextValue() {
        return `BootApp_${this._app.state}`;
    }
}
class LocalAppTreeProvider {
    constructor(manager) {
        this._manager = manager;
        this.onDidChangeTreeData = this._manager.onDidChangeApps;
        this._manager.fireDidChangeApps();
    }
    getTreeItem(element) {
        return new BootAppItem(element);
    }
    getChildren(element) {
        if (!element) {
            return this._manager.getAppList();
        }
        else {
            return [];
        }
    }
}
exports.LocalAppTreeProvider = LocalAppTreeProvider;
//# sourceMappingURL=LocalAppTree.js.map