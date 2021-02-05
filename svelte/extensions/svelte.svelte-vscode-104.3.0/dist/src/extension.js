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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const node_1 = require("vscode-languageclient/node");
const autoClose_1 = require("./html/autoClose");
const htmlEmptyTagsShared_1 = require("./html/htmlEmptyTagsShared");
const CompiledCodeContentProvider_1 = __importDefault(require("./CompiledCodeContentProvider"));
const path = __importStar(require("path"));
var TagCloseRequest;
(function (TagCloseRequest) {
    TagCloseRequest.type = new vscode_languageclient_1.RequestType('html/tag');
})(TagCloseRequest || (TagCloseRequest = {}));
function activate(context) {
    var _a;
    warnIfOldExtensionInstalled();
    const runtimeConfig = vscode_1.workspace.getConfiguration('svelte.language-server');
    const { workspaceFolders } = vscode_1.workspace;
    const rootPath = Array.isArray(workspaceFolders) ? workspaceFolders[0].uri.fsPath : undefined;
    const tempLsPath = runtimeConfig.get('ls-path');
    // Returns undefined if path is empty string
    // Return absolute path if not already
    const lsPath = tempLsPath && tempLsPath.trim() !== ''
        ? path.isAbsolute(tempLsPath)
            ? tempLsPath
            : path.join(rootPath, tempLsPath)
        : undefined;
    const serverModule = require.resolve(lsPath || 'svelte-language-server/bin/server.js');
    console.log('Loading server from ', serverModule);
    const runExecArgv = [];
    let port = (_a = runtimeConfig.get('port')) !== null && _a !== void 0 ? _a : -1;
    if (port < 0) {
        port = 6009;
    }
    else {
        console.log('setting port to', port);
        runExecArgv.push(`--inspect=${port}`);
    }
    const debugOptions = { execArgv: ['--nolazy', `--inspect=${port}`] };
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: { execArgv: runExecArgv }
        },
        debug: { module: serverModule, transport: node_1.TransportKind.ipc, options: debugOptions }
    };
    const serverRuntime = runtimeConfig.get('runtime');
    if (serverRuntime) {
        serverOptions.run.runtime = serverRuntime;
        serverOptions.debug.runtime = serverRuntime;
        console.log('setting server runtime to', serverRuntime);
    }
    const clientOptions = {
        documentSelector: [{ scheme: 'file', language: 'svelte' }],
        revealOutputChannelOn: vscode_languageclient_1.RevealOutputChannelOn.Never,
        synchronize: {
            configurationSection: ['svelte', 'javascript', 'typescript', 'prettier'],
            fileEvents: vscode_1.workspace.createFileSystemWatcher('{**/*.js,**/*.ts}', false, false, false)
        },
        initializationOptions: {
            config: vscode_1.workspace.getConfiguration('svelte.plugin'),
            prettierConfig: vscode_1.workspace.getConfiguration('prettier'),
            emmetConfig: vscode_1.workspace.getConfiguration('emmet'),
            typescriptConfig: {
                typescript: vscode_1.workspace.getConfiguration('typescript'),
                javascript: vscode_1.workspace.getConfiguration('javascript')
            },
            dontFilterIncompleteCompletions: true // VSCode filters client side and is smarter at it than us
        }
    };
    let ls = createLanguageServer(serverOptions, clientOptions);
    context.subscriptions.push(ls.start());
    ls.onReady().then(() => {
        const tagRequestor = (document, position) => {
            const param = ls.code2ProtocolConverter.asTextDocumentPositionParams(document, position);
            return ls.sendRequest(TagCloseRequest.type, param);
        };
        const disposable = autoClose_1.activateTagClosing(tagRequestor, { svelte: true }, 'html.autoClosingTags');
        context.subscriptions.push(disposable);
    });
    vscode_1.workspace.onDidSaveTextDocument(async (doc) => {
        const parts = doc.uri.toString(true).split(/\/|\\/);
        if (['tsconfig.json', 'jsconfig.json'].includes(parts[parts.length - 1])) {
            await restartLS(false);
        }
    });
    context.subscriptions.push(vscode_1.commands.registerCommand('svelte.restartLanguageServer', async () => {
        await restartLS(true);
    }));
    async function restartLS(showNotification) {
        await ls.stop();
        ls = createLanguageServer(serverOptions, clientOptions);
        context.subscriptions.push(ls.start());
        await ls.onReady();
        if (showNotification) {
            vscode_1.window.showInformationMessage('Svelte language server restarted.');
        }
    }
    function getLS() {
        return ls;
    }
    addDidChangeTextDocumentListener(getLS);
    addRenameFileListener(getLS);
    addCompilePreviewCommand(getLS, context);
    addExtracComponentCommand(getLS, context);
    vscode_1.languages.setLanguageConfiguration('svelte', {
        indentationRules: {
            // Matches a valid opening tag that is:
            //  - Not a doctype
            //  - Not a void element
            //  - Not a closing tag
            //  - Not followed by a closing tag of the same element
            // Or matches `<!--`
            // Or matches open curly brace
            //
            // eslint-disable-next-line max-len, no-useless-escape
            increaseIndentPattern: /<(?!\?|(?:area|base|br|col|frame|hr|html|img|input|link|meta|param)\b|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
            // Matches a closing tag that:
            //  - Follows optional whitespace
            //  - Is not `</html>`
            // Or matches `-->`
            // Or closing curly brace
            //
            // eslint-disable-next-line no-useless-escape
            decreaseIndentPattern: /^\s*(<\/(?!html)[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
        },
        // Matches a number or word that either:
        //  - Is a number with an optional negative sign and optional full number
        //    with numbers following the decimal point. e.g `-1.1px`, `.5`, `-.42rem`, etc
        //  - Is a sequence of characters without spaces and not containing
        //    any of the following: `~!@$^&*()=+[{]}\|;:'",.<>/
        //
        // eslint-disable-next-line max-len, no-useless-escape
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\#\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
        onEnterRules: [
            {
                // Matches an opening tag that:
                //  - Isn't an empty element
                //  - Is possibly namespaced
                //  - Isn't a void element
                //  - Isn't followed by another tag on the same line
                //
                // eslint-disable-next-line no-useless-escape
                beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                // Matches a closing tag that:
                //  - Is possibly namespaced
                //  - Possibly has excess whitespace following tagname
                afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
                action: { indentAction: vscode_1.IndentAction.IndentOutdent }
            },
            {
                // Matches an opening tag that:
                //  - Isn't an empty element
                //  - Isn't namespaced
                //  - Isn't a void element
                //  - Isn't followed by another tag on the same line
                //
                // eslint-disable-next-line no-useless-escape
                beforeText: new RegExp(`<(?!(?:${htmlEmptyTagsShared_1.EMPTY_ELEMENTS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
                action: { indentAction: vscode_1.IndentAction.Indent }
            }
        ]
    });
    // This API is considered private and only exposed for experimenting.
    // Interface may change at any time. Use at your own risk!
    return {
        /**
         * As a function, because restarting the server
         * will result in another instance.
         */
        getLanguageServer: getLS
    };
}
exports.activate = activate;
function addDidChangeTextDocumentListener(getLS) {
    // Only Svelte file changes are automatically notified through the inbuilt LSP
    // because the extension says it's only responsible for Svelte files.
    // Therefore we need to set this up for TS/JS files manually.
    vscode_1.workspace.onDidChangeTextDocument((evt) => {
        if (evt.document.languageId === 'typescript' || evt.document.languageId === 'javascript') {
            getLS().sendNotification('$/onDidChangeTsOrJsFile', {
                uri: evt.document.uri.toString(true),
                changes: evt.contentChanges.map((c) => ({
                    range: {
                        start: { line: c.range.start.line, character: c.range.start.character },
                        end: { line: c.range.end.line, character: c.range.end.character }
                    },
                    text: c.text
                }))
            });
        }
    });
}
function addRenameFileListener(getLS) {
    vscode_1.workspace.onDidRenameFiles(async (evt) => {
        const oldUri = evt.files[0].oldUri.toString(true);
        const parts = oldUri.split(/\/|\\/);
        const lastPart = parts[parts.length - 1];
        // If user moves/renames a folder, the URI only contains the parts up to that folder,
        // and not files. So in case the URI does not contain a '.', check for imports to update.
        if (lastPart.includes('.') &&
            !['.ts', '.js', '.json', '.svelte'].some((ending) => lastPart.endsWith(ending))) {
            return;
        }
        vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window, title: 'Updating Imports..' }, async () => {
            var _a;
            const editsForFileRename = await getLS().sendRequest('$/getEditsForFileRename', 
            // Right now files is always an array with a single entry.
            // The signature was only designed that way to - maybe, in the future -
            // have the possibility to change that. If that ever does, update this.
            // In the meantime, just assume it's a single entry and simplify the
            // rest of the logic that way.
            {
                oldUri,
                newUri: evt.files[0].newUri.toString(true)
            });
            if (!editsForFileRename) {
                return;
            }
            const workspaceEdit = new vscode_1.WorkspaceEdit();
            // Renaming a file should only result in edits of existing files
            (_a = editsForFileRename.documentChanges) === null || _a === void 0 ? void 0 : _a.filter(vscode_languageclient_1.TextDocumentEdit.is).forEach((change) => change.edits.forEach((edit) => {
                workspaceEdit.replace(vscode_1.Uri.parse(change.textDocument.uri), new vscode_1.Range(new vscode_1.Position(edit.range.start.line, edit.range.start.character), new vscode_1.Position(edit.range.end.line, edit.range.end.character)), edit.newText);
            }));
            vscode_1.workspace.applyEdit(workspaceEdit);
        });
    });
}
function addCompilePreviewCommand(getLS, context) {
    const compiledCodeContentProvider = new CompiledCodeContentProvider_1.default(getLS);
    context.subscriptions.push(vscode_1.workspace.registerTextDocumentContentProvider(CompiledCodeContentProvider_1.default.scheme, compiledCodeContentProvider), compiledCodeContentProvider);
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('svelte.showCompiledCodeToSide', async (editor) => {
        var _a;
        if (((_a = editor === null || editor === void 0 ? void 0 : editor.document) === null || _a === void 0 ? void 0 : _a.languageId) !== 'svelte') {
            return;
        }
        const uri = editor.document.uri;
        const svelteUri = CompiledCodeContentProvider_1.default.toSvelteSchemeUri(uri);
        vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window, title: 'Compiling..' }, async () => {
            return await vscode_1.window.showTextDocument(svelteUri, {
                preview: true,
                viewColumn: vscode_1.ViewColumn.Beside
            });
        });
    }));
}
function addExtracComponentCommand(getLS, context) {
    context.subscriptions.push(vscode_1.commands.registerTextEditorCommand('svelte.extractComponent', async (editor) => {
        var _a;
        if (((_a = editor === null || editor === void 0 ? void 0 : editor.document) === null || _a === void 0 ? void 0 : _a.languageId) !== 'svelte') {
            return;
        }
        // Prompt for new component name
        const options = {
            prompt: 'Component Name: ',
            placeHolder: 'NewComponent'
        };
        vscode_1.window.showInputBox(options).then(async (filePath) => {
            if (!filePath) {
                return vscode_1.window.showErrorMessage('No component name');
            }
            const uri = editor.document.uri.toString();
            const range = editor.selection;
            getLS().sendRequest(vscode_languageclient_1.ExecuteCommandRequest.type, {
                command: 'extract_to_svelte_component',
                arguments: [uri, { uri, range, filePath }]
            });
        });
    }));
}
function createLanguageServer(serverOptions, clientOptions) {
    return new node_1.LanguageClient('svelte', 'Svelte', serverOptions, clientOptions);
}
function warnIfOldExtensionInstalled() {
    if (vscode_1.extensions.getExtension('JamesBirtles.svelte-vscode')) {
        vscode_1.window.showWarningMessage('It seems you have the old and deprecated extension named "Svelte" installed. Please remove it. ' +
            'Through the UI: You can find it when searching for "@installed" in the extensions window (searching "Svelte" won\'t work). ' +
            'Command line: "code --uninstall-extension JamesBirtles.svelte-vscode"');
    }
}
//# sourceMappingURL=extension.js.map