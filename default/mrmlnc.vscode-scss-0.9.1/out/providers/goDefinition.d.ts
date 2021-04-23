import { Location } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import StorageService from '../services/storage';
export declare function goDefinition(document: TextDocument, offset: number, storage: StorageService): Promise<Location>;
