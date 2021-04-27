import { SignatureHelp } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import StorageService from '../services/storage';
export declare function doSignatureHelp(document: TextDocument, offset: number, storage: StorageService): Promise<SignatureHelp>;
