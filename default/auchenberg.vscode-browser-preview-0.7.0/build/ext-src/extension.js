"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const targetTreeProvider_1 = require("./targetTreeProvider");
const debugProvider_1 = require("./debugProvider");
const BrowserViewWindowManager_1 = require("./BrowserViewWindowManager");
const live_share_1 = require("./live-share");
const telemetry_1 = require("./telemetry");
function activate(context) {
    const telemetry = new telemetry_1.Telemetry();
    const windowManager = new BrowserViewWindowManager_1.BrowserViewWindowManager(context.extensionPath, telemetry);
    const debugProvider = new debugProvider_1.default(windowManager, telemetry);
    telemetry.sendEvent('activate');
    vscode.window.registerTreeDataProvider('targetTree', new targetTreeProvider_1.default());
    vscode.debug.registerDebugConfigurationProvider('browser-preview', debugProvider.getProvider());
    context.subscriptions.push(vscode.commands.registerCommand('browser-preview.openPreview', (url) => {
        telemetry.sendEvent('openPreview');
        windowManager.create(url);
    }), vscode.commands.registerCommand('browser-preview.openActiveFile', () => {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return; // no active editor: ignore the command
        }
        // get active url
        const filename = activeEditor.document.fileName;
        telemetry.sendEvent('openActiveFile');
        if (filename) {
            windowManager.create(`file://${filename}`);
        }
    }));
    live_share_1.setupLiveShare(context.extensionPath, windowManager);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map