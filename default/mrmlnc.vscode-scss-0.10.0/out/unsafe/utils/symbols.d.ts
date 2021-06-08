import type { IDocumentSymbols } from '../types/symbols';
import type StorageService from '../services/storage';
/**
 * Returns Symbols from all documents.
 */
export declare function getSymbolsCollection(storage: StorageService): IDocumentSymbols[];
export declare function getSymbolsRelatedToDocument(storage: StorageService, current: string): IDocumentSymbols[];
