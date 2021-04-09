"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
const lodash_1 = require("lodash");
const SVELTE_URI_SCHEME = 'svelte-compiled';
function toSvelteSchemeUri(srcUri, asString) {
    srcUri = typeof srcUri == 'string' ? vscode_1.Uri.parse(srcUri) : srcUri;
    const src = utils_1.btoa(srcUri.toString());
    const destUri = srcUri.with({
        scheme: SVELTE_URI_SCHEME,
        fragment: src,
        path: srcUri.path + '.js'
    });
    return (asString ? destUri.toString() : destUri);
}
function fromSvelteSchemeUri(destUri, asString) {
    destUri = typeof destUri == 'string' ? vscode_1.Uri.parse(destUri) : destUri;
    const src = utils_1.atob(destUri.fragment);
    return (asString ? src : vscode_1.Uri.parse(src));
}
class CompiledCodeContentProvider {
    constructor(getLanguageClient) {
        this.getLanguageClient = getLanguageClient;
        this.disposed = false;
        this.didChangeEmitter = new vscode_1.EventEmitter();
        this.subscriptions = [];
        this.watchedSourceUri = new Set();
        this.subscriptions.push(vscode_1.workspace.onDidChangeTextDocument(lodash_1.debounce(async (changeEvent) => {
            if (changeEvent.document.languageId !== 'svelte') {
                return;
            }
            const srcUri = changeEvent.document.uri.toString();
            if (this.watchedSourceUri.has(srcUri)) {
                this.didChangeEmitter.fire(toSvelteSchemeUri(srcUri));
            }
        }, 500)));
        vscode_1.window.onDidChangeVisibleTextEditors((editors) => {
            const previewEditors = editors.filter((editor) => { var _a, _b; return ((_b = (_a = editor === null || editor === void 0 ? void 0 : editor.document) === null || _a === void 0 ? void 0 : _a.uri) === null || _b === void 0 ? void 0 : _b.scheme) === SVELTE_URI_SCHEME; });
            this.watchedSourceUri = new Set(previewEditors.map((editor) => fromSvelteSchemeUri(editor.document.uri, true)));
        });
    }
    get onDidChange() {
        return this.didChangeEmitter.event;
    }
    async provideTextDocumentContent(uri) {
        var _a;
        const srcUriStr = fromSvelteSchemeUri(uri, true);
        this.watchedSourceUri.add(srcUriStr);
        const resp = await this.getLanguageClient().sendRequest('$/getCompiledCode', srcUriStr);
        if ((_a = resp === null || resp === void 0 ? void 0 : resp.js) === null || _a === void 0 ? void 0 : _a.code) {
            return resp.js.code;
        }
        else {
            vscode_1.window.setStatusBarMessage(`Svelte: fail to compile ${uri.path}`, 3000);
        }
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.didChangeEmitter.dispose();
        this.subscriptions.forEach((d) => d.dispose());
        this.subscriptions.length = 0;
        this.disposed = true;
    }
}
exports.default = CompiledCodeContentProvider;
CompiledCodeContentProvider.scheme = SVELTE_URI_SCHEME;
CompiledCodeContentProvider.toSvelteSchemeUri = toSvelteSchemeUri;
CompiledCodeContentProvider.fromSvelteSchemeUri = fromSvelteSchemeUri;
//# sourceMappingURL=CompiledCodeContentProvider.js.map