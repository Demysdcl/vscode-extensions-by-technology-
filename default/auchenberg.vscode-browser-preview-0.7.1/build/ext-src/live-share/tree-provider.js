"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const vscode_2 = require("vsls/vscode");
const path = require("path");
class BroswerTreeDataProvider {
    constructor(extensionPath, vslsApi, windowManager) {
        this.extensionPath = extensionPath;
        this.vslsApi = vslsApi;
        this.windowManager = windowManager;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.refresh = () => {
            this._onDidChangeTreeData.fire();
        };
        this.refreshWhenUrlChanges = (window) => {
            let previousUrl = window.getState().url;
            return () => {
                const { url } = window.getState();
                if (previousUrl !== url) {
                    previousUrl = url;
                    this.refresh();
                }
            };
        };
        windowManager.openWindows.forEach((window) => {
            window.on('stateChanged', this.refreshWhenUrlChanges(window));
        });
        windowManager.on('windowCreated', (id) => {
            const window = windowManager.getById(id);
            if (!window) {
                return;
            }
            window.on('stateChanged', this.refreshWhenUrlChanges(window));
            this.refresh();
        });
        windowManager.on('windowDisposed', this.refresh);
    }
    getChildren(element) {
        if (!element) {
            return [this.getRootTreeItem()];
        }
        if (this.windowManager.openWindows.size === 0) {
            if (this.vslsApi.session.role === vscode_2.Role.Host) {
                return [this.getShareBrowserTreeItem()];
            }
            else {
                return [this.getNoSharedBrowserTreeItem()];
            }
        }
        return this.getSharedBrowserTreeItems();
    }
    getTreeItem(element) {
        return element;
    }
    getRootTreeItem() {
        const label = `Shared Browsers (${this.windowManager.openWindows.size})`;
        return new vscode_1.TreeItem(label, vscode_1.TreeItemCollapsibleState.Expanded);
    }
    getShareBrowserTreeItem() {
        const treeItem = new vscode_1.TreeItem('Share browser...');
        treeItem.command = {
            title: 'Share browser...',
            command: 'browser-preview.openPreview'
        };
        return treeItem;
    }
    getNoSharedBrowserTreeItem() {
        return new vscode_1.TreeItem('No browsers shared');
    }
    getSharedBrowserTreeItems() {
        const result = [...this.windowManager.openWindows];
        return result.map((item) => {
            const { url } = item.getState();
            const treeItem = new vscode_1.TreeItem(url);
            treeItem.command = {
                title: 'Open Shared Browser',
                command: 'browser-preview.openSharedBrowser',
                arguments: [item.id]
            };
            treeItem.iconPath = {
                dark: path.join(this.extensionPath, 'resources/icon_dark.svg'),
                light: path.join(this.extensionPath, 'resources/icon_light.svg')
            };
            return treeItem;
        });
    }
}
function default_1(extensionPath, vslsApi, windowManager) {
    const treeDataProvider = new BroswerTreeDataProvider(extensionPath, vslsApi, windowManager);
    vslsApi.registerTreeDataProvider(vscode_2.View.Session, treeDataProvider);
    vslsApi.registerTreeDataProvider(vscode_2.View.ExplorerSession, treeDataProvider);
}
exports.default = default_1;
//# sourceMappingURL=tree-provider.js.map