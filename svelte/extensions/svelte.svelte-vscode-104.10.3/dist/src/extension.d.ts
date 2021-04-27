import { ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
export declare function activate(context: ExtensionContext): {
    /**
     * As a function, because restarting the server
     * will result in another instance.
     */
    getLanguageServer: () => LanguageClient;
};
