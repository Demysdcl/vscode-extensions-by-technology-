import { Hover } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type StorageService from '../services/storage';
export declare function doHover(document: TextDocument, offset: number, storage: StorageService): Promise<Hover | null>;
