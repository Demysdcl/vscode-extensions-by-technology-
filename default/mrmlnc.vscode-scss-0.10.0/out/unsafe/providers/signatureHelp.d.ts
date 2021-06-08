import { SignatureHelp } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type StorageService from '../services/storage';
export declare function doSignatureHelp(document: TextDocument, offset: number, storage: StorageService): Promise<SignatureHelp>;
