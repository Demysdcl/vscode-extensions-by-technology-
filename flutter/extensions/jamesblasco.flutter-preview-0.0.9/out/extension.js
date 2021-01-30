"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
const preview_1 = require("./preview");
const spawn = require('child_process').spawn;
const isActiveContext = 'flutter_preview.isActive';
var service;
function activate(context) {
    console.log('Congratulations, your extension "flutter-preview" is now active!');
    vscode.commands.executeCommand("setContext", isActiveContext, false);
    vscode.commands.executeCommand("flutter-preview.activate");
    let disposable2 = vscode.commands.registerCommand('flutter-preview.activate', () => {
        // The code you place here will be executed every time your command is executed
        if (vscode.workspace.workspaceFolders) {
            const folderPath = vscode.workspace.workspaceFolders[0].uri;
            service === null || service === void 0 ? void 0 : service.dispose();
            service = new preview_1.PreviewService(folderPath);
        }
        else {
            vscode.window.showInformationMessage('No Workspace Found');
        }
    });
    let disposable = vscode.commands.registerCommand('flutter-preview.run', () => {
        service === null || service === void 0 ? void 0 : service.start();
    });
    //	envStatusBarItem.command = disposable;
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    service === null || service === void 0 ? void 0 : service.dispose();
    service = undefined;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map