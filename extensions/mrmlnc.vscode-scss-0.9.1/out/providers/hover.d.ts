import { Hover } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import StorageService from '../services/storage';
export declare function doHover(document: TextDocument, offset: number, storage: StorageService): Promise<Hover | null>;
