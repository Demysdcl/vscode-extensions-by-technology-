import * as VSCode from 'vscode';
import { LanguageClient } from "vscode-languageclient/node";
import { ActivatorOptions } from '@pivotal-tools/commons-vscode';
/** Called when extension is activated */
export declare function activate(client: LanguageClient, options: ActivatorOptions, context: VSCode.ExtensionContext): void;
