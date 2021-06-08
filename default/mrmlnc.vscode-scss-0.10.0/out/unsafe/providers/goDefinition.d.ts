import { Location } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type StorageService from '../services/storage';
export declare function goDefinition(document: TextDocument, offset: number, storage: StorageService): Promise<Location | null>;
