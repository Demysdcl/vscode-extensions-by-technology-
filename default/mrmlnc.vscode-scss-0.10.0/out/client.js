"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode = require("vscode");
const node_1 = require("vscode-languageclient/node");
const constants_1 = require("./constants");
const EXTENSION_SERVER_MODULE_PATH = path.join(__dirname, './unsafe/server.js');
const EXTENSION_DEFAULT_DEBUG_PORT = -1;
const clients = new Map();
async function activate(context) {
    context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(changeWorkspaceFoldersEventHandler), vscode.window.onDidChangeActiveTextEditor(changeActiveTextEditorEventHandler));
    await changeActiveTextEditorEventHandler(vscode.window.activeTextEditor);
}
exports.activate = activate;
async function deactivate() {
    await Promise.all([...clients.values()].map((client) => client.stop()));
}
exports.deactivate = deactivate;
async function changeWorkspaceFoldersEventHandler(event) {
    await Promise.all(event.removed.map((folder) => { var _a; return (_a = clients.get(folder.uri.fsPath)) === null || _a === void 0 ? void 0 : _a.stop(); }));
}
async function changeActiveTextEditorEventHandler(editor) {
    const document = editor === null || editor === void 0 ? void 0 : editor.document;
    const uri = document === null || document === void 0 ? void 0 : document.uri;
    /**
     * Here the `scheme` field may not be `file` when the active window is a panel like `output`.
     * The plugin only works with files, so other types of editors are ignored.
     */
    if ((uri === null || uri === void 0 ? void 0 : uri.scheme) !== 'file') {
        return;
    }
    const workspace = vscode.workspace.getWorkspaceFolder(uri);
    if (workspace === undefined || clients.has(workspace.uri.toString())) {
        return;
    }
    await initializeClient(workspace);
}
async function initializeClient(workspace) {
    const client = buildClient(workspace.uri);
    clients.set(workspace.uri.toString(), client);
    return vscode.window.withProgress({
        title: `[${workspace.name}] Starting SCSS IntelliSense server`,
        location: vscode.ProgressLocation.Window
    }, async () => {
        var _a;
        client.start();
        try {
            await client.onReady();
        }
        catch (error) {
            await vscode.window.showErrorMessage(`Client initialization failed. ${(_a = error.stack) !== null && _a !== void 0 ? _a : '<empty_stack>'}`);
        }
        return client;
    });
}
function buildClient(workspace) {
    return new node_1.LanguageClient(constants_1.EXTENSION_ID, constants_1.EXTENSION_NAME, buildServerOptions(workspace), buildClientOptions(workspace));
}
function buildServerOptions(workspace) {
    const extensionServerPort = vscode.workspace.getConfiguration('scss.dev', workspace).get('serverPort', EXTENSION_DEFAULT_DEBUG_PORT);
    const configuration = {
        module: EXTENSION_SERVER_MODULE_PATH,
        transport: node_1.TransportKind.ipc,
        options: {
            execArgv: extensionServerPort === EXTENSION_DEFAULT_DEBUG_PORT ? [] : [`--inspect=${extensionServerPort}`]
        }
    };
    return {
        run: Object.assign({}, configuration),
        debug: Object.assign(Object.assign({}, configuration), { options: {
                execArgv: ['--nolazy', '--inspect=6006']
            } })
    };
}
function buildClientOptions(workspace) {
    /**
     * The workspace path is used to separate clients in multi-workspace environment.
     * Otherwise, each client will participate in each workspace.
     */
    const pattern = `${workspace.fsPath.replace(/\\/g, '/')}/**`;
    return {
        documentSelector: [
            { scheme: 'file', language: 'scss', pattern },
            { scheme: 'file', language: 'vue', pattern }
        ],
        synchronize: {
            configurationSection: ['scss'],
            fileEvents: vscode.workspace.createFileSystemWatcher({
                base: workspace.fsPath,
                pattern: '**/*.scss'
            })
        },
        initializationOptions: {
            workspace: workspace.fsPath,
            settings: vscode.workspace.getConfiguration('scss', workspace)
        },
        // Don't open the output console (very annoying) in case of error
        revealOutputChannelOn: node_1.RevealOutputChannelOn.Never
    };
}
