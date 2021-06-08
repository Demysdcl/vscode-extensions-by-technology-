import { DocumentLink } from 'vscode-css-languageservice';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type { IDocument, IImport } from '../types/symbols';
/**
 * Returns all Symbols in a single document.
 */
export declare function parseDocument(document: TextDocument, offset?: number | null): Promise<IDocument>;
export declare function convertLinksToImports(links: DocumentLink[]): IImport[];
