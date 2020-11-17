"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class BootAppItem {
    constructor(context, app) {
        this._context = context;
        this._app = app;
    }
    get label() {
        return this._app.name;
    }
    get iconPath() {
        return this._context.asAbsolutePath(path.join('resources', `${this.state}.svg`));
    }
    get state() {
        return this._app.state;
    }
    get contextValue() {
        return `BootApp_${this._app.state}`;
    }
}
exports.BootAppItem = BootAppItem;
class LocalAppTreeProvider {
    constructor(context, manager) {
        this._manager = manager;
        this._context = context;
        this.onDidChangeTreeData = this._manager.onDidChangeApps;
        this._manager.fireDidChangeApps();
    }
    getTreeItem(element) {
        return new BootAppItem(this._context, element);
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