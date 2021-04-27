"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const EventEmitter = require("eventemitter2");
const contentProvider_1 = require("./contentProvider");
const uuidv4 = require('uuid/v4');
exports.PANEL_TITLE = 'Browser Preview';
class BrowserViewWindow extends EventEmitter.EventEmitter2 {
    constructor(config, browser, id) {
        super();
        this._disposables = [];
        this.state = {};
        this.config = config;
        this._panel = null;
        this.browserPage = null;
        this.browser = browser;
        this.contentProvider = new contentProvider_1.default(this.config);
        this.id = id || uuidv4();
    }
    async launch(startUrl) {
        try {
            this.browserPage = await this.browser.newPage();
            if (this.browserPage) {
                this.browserPage.else((data) => {
                    if (this._panel) {
                        this._panel.webview.postMessage(data);
                    }
                });
            }
        }
        catch (err) {
            vscode.window.showErrorMessage(err.message);
        }
        // let columnNumber = <number>this.config.columnNumber;
        // var column = <any>vscode.ViewColumn[columnNumber];
        let showOptions = {
            viewColumn: vscode.ViewColumn.Beside
        };
        this._panel = vscode.window.createWebviewPanel(BrowserViewWindow.viewType, 'Browser Preview', showOptions, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.config.extensionPath, 'build'))]
        });
        this._panel.webview.html = this.contentProvider.getContent();
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.onDidReceiveMessage((msg) => {
            if (msg.type === 'extension.updateTitle') {
                if (this._panel) {
                    this._panel.title = msg.params.title;
                    return;
                }
            }
            if (msg.type === 'extension.windowOpenRequested') {
                this.emit('windowOpenRequested', {
                    url: msg.params.url
                });
            }
            if (msg.type === 'extension.openFile') {
                this.handleOpenFileRequest(msg.params);
            }
            if (msg.type === 'extension.windowDialogRequested') {
                const { message, type } = msg.params;
                if (type == 'alert') {
                    vscode.window.showInformationMessage(message);
                    if (this.browserPage) {
                        this.browserPage.send('Page.handleJavaScriptDialog', {
                            accept: true
                        });
                    }
                }
                else if (type === 'prompt') {
                    vscode.window.showInputBox({ placeHolder: message }).then((result) => {
                        if (this.browserPage) {
                            this.browserPage.send('Page.handleJavaScriptDialog', {
                                accept: true,
                                promptText: result
                            });
                        }
                    });
                }
                else if (type === 'confirm') {
                    vscode.window.showQuickPick(['Ok', 'Cancel']).then((result) => {
                        if (this.browserPage) {
                            this.browserPage.send('Page.handleJavaScriptDialog', {
                                accept: result === 'Ok'
                            });
                        }
                    });
                }
            }
            if (msg.type === 'extension.appStateChanged') {
                this.state = msg.params.state;
                this.emit('stateChanged');
            }
            if (this.browserPage) {
                try {
                    // not sure about this one but this throws later with unhandled
                    // 'extension.appStateChanged' message
                    if (msg.type !== 'extension.appStateChanged') {
                        this.browserPage.send(msg.type, msg.params, msg.callbackId);
                    }
                    this.emit(msg.type, msg.params);
                }
                catch (err) {
                    vscode.window.showErrorMessage(err);
                }
            }
        }, null, this._disposables);
        // Update starturl if requested to launch specifi page.
        if (startUrl) {
            this.config.startUrl = startUrl;
        }
        this._panel.webview.postMessage({
            method: 'extension.appConfiguration',
            result: this.config
        });
    }
    getState() {
        return this.state;
    }
    setViewport(viewport) {
        this._panel.webview.postMessage({
            method: 'extension.viewport',
            result: viewport
        });
    }
    show() {
        if (this._panel) {
            this._panel.reveal();
        }
    }
    dispose() {
        if (this._panel) {
            this._panel.dispose();
        }
        if (this.browserPage) {
            this.browserPage.dispose();
            this.browserPage = null;
        }
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
        this.emit('disposed');
        this.removeAllListeners();
    }
    handleOpenFileRequest(params) {
        let lineNumber = params.lineNumber;
        let columnNumber = params.columnNumber | params.charNumber | 0;
        let workspacePath = (vscode.workspace.rootPath || '') + '/';
        let relativePath = params.fileName.replace(workspacePath, '');
        vscode.workspace.findFiles(relativePath, '', 1).then((file) => {
            if (!file || !file.length) {
                return;
            }
            var firstFile = file[0];
            // Open document
            vscode.workspace.openTextDocument(firstFile).then((document) => {
                // Show the document
                vscode.window.showTextDocument(document, vscode.ViewColumn.One).then((document) => {
                    if (lineNumber) {
                        // Adjust line position from 1 to zero-based.
                        let pos = new vscode.Position(-1 + lineNumber, columnNumber);
                        document.selection = new vscode.Selection(pos, pos);
                    }
                }, (reason) => {
                    vscode.window.showErrorMessage(`Failed to show file. ${reason}`);
                });
            }, (err) => {
                vscode.window.showErrorMessage(`Failed to open file. ${err}`);
            });
        });
    }
}
BrowserViewWindow.viewType = 'browser-preview';
exports.BrowserViewWindow = BrowserViewWindow;
//# sourceMappingURL=BrowserViewWindow.js.map