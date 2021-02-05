/// <reference types="vscode-languageclient/typings/vscode-proposed" />
/// <reference types="vscode-languageclient/lib/common/client" />
import { LanguageClient } from 'vscode-languageclient/node';
import { Uri, TextDocumentContentProvider } from 'vscode';
declare function toSvelteSchemeUri<B extends boolean = false>(srcUri: string | Uri, asString?: B): B extends true ? string : Uri;
declare function fromSvelteSchemeUri<B extends boolean = false>(destUri: string | Uri, asString?: B): B extends true ? string : Uri;
export default class CompiledCodeContentProvider implements TextDocumentContentProvider {
    private getLanguageClient;
    static scheme: string;
    static toSvelteSchemeUri: typeof toSvelteSchemeUri;
    static fromSvelteSchemeUri: typeof fromSvelteSchemeUri;
    private disposed;
    private didChangeEmitter;
    private subscriptions;
    private watchedSourceUri;
    get onDidChange(): import("vscode").Event<Uri>;
    constructor(getLanguageClient: () => LanguageClient);
    provideTextDocumentContent(uri: Uri): Promise<string | undefined>;
    dispose(): void;
}
export {};
