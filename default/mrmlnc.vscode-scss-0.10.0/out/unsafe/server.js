'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const scanner_1 = require("./services/scanner");
const storage_1 = require("./services/storage");
const completion_1 = require("./providers/completion");
const hover_1 = require("./providers/hover");
const signatureHelp_1 = require("./providers/signatureHelp");
const goDefinition_1 = require("./providers/goDefinition");
const workspaceSymbol_1 = require("./providers/workspaceSymbol");
const fs_1 = require("./utils/fs");
const vue_1 = require("./utils/vue");
const vscode_uri_1 = require("vscode-uri");
let workspaceRoot;
let settings;
let storageService;
let scannerService;
// Create a connection for the server
const connection = node_1.createConnection(new node_1.IPCMessageReader(process), new node_1.IPCMessageWriter(process));
console.log = connection.console.log.bind(connection.console);
console.error = connection.console.error.bind(connection.console);
// Create a simple text document manager. The text document manager
// _supports full document sync only
const documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
// Make the text document manager listen on the connection
// _for open, change and close text document events
documents.listen(connection);
// After the server has started the client sends an initilize request. The server receives
// _in the passed params the rootPath of the workspace plus the client capabilites
connection.onInitialize(async (params) => {
    const options = params.initializationOptions;
    workspaceRoot = options.workspace;
    settings = options.settings;
    storageService = new storage_1.default();
    scannerService = new scanner_1.default(storageService, settings);
    const files = await fs_1.findFiles('**/*.scss', {
        cwd: workspaceRoot,
        deep: settings.scannerDepth,
        ignore: settings.scannerExclude
    });
    try {
        await scannerService.scan(files);
    }
    catch (error) {
        if (settings.showErrors) {
            connection.window.showErrorMessage(error);
        }
    }
    return {
        capabilities: {
            textDocumentSync: node_1.TextDocumentSyncKind.Incremental,
            completionProvider: { resolveProvider: false },
            signatureHelpProvider: {
                triggerCharacters: ['(', ',', ';']
            },
            hoverProvider: true,
            definitionProvider: true,
            workspaceSymbolProvider: true
        }
    };
});
connection.onDidChangeConfiguration(params => {
    settings = params.settings.scss;
});
connection.onDidChangeWatchedFiles(event => {
    const files = event.changes.map((file) => vscode_uri_1.URI.parse(file.uri).fsPath);
    return scannerService.scan(files);
});
connection.onCompletion(textDocumentPosition => {
    const uri = documents.get(textDocumentPosition.textDocument.uri);
    if (uri === undefined) {
        return;
    }
    const { document, offset } = vue_1.getSCSSRegionsDocument(uri, textDocumentPosition.position);
    if (!document) {
        return null;
    }
    return completion_1.doCompletion(document, offset, settings, storageService);
});
connection.onHover(textDocumentPosition => {
    const uri = documents.get(textDocumentPosition.textDocument.uri);
    if (uri === undefined) {
        return;
    }
    const { document, offset } = vue_1.getSCSSRegionsDocument(uri, textDocumentPosition.position);
    if (!document) {
        return null;
    }
    return hover_1.doHover(document, offset, storageService);
});
connection.onSignatureHelp(textDocumentPosition => {
    const uri = documents.get(textDocumentPosition.textDocument.uri);
    if (uri === undefined) {
        return;
    }
    const { document, offset } = vue_1.getSCSSRegionsDocument(uri, textDocumentPosition.position);
    if (!document) {
        return null;
    }
    return signatureHelp_1.doSignatureHelp(document, offset, storageService);
});
connection.onDefinition(textDocumentPosition => {
    const uri = documents.get(textDocumentPosition.textDocument.uri);
    if (uri === undefined) {
        return;
    }
    const { document, offset } = vue_1.getSCSSRegionsDocument(uri, textDocumentPosition.position);
    if (!document) {
        return null;
    }
    return goDefinition_1.goDefinition(document, offset, storageService);
});
connection.onWorkspaceSymbol(workspaceSymbolParams => {
    return workspaceSymbol_1.searchWorkspaceSymbol(workspaceSymbolParams.query, storageService, workspaceRoot);
});
connection.onShutdown(() => {
    storageService.clear();
});
connection.listen();
