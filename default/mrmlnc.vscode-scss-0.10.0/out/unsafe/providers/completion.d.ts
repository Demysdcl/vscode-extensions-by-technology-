import { CompletionList } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { ISettings } from '../types/settings';
import type StorageService from '../services/storage';
export declare function doCompletion(document: TextDocument, offset: number, settings: ISettings, storage: StorageService): Promise<CompletionList | null>;
