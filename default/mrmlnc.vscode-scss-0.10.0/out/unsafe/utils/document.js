'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDocumentContext = exports.getDocumentPath = void 0;
const path = require("path");
/**
 * Returns the path to the document, relative to the current document.
 */
function getDocumentPath(currentPath, symbolsPath) {
    if (symbolsPath === undefined) {
        throw new Error("Unexpected behaviour. The 'symbolsPath' argument is undefined.");
    }
    const rootUri = path.dirname(currentPath);
    const docPath = path.relative(rootUri, symbolsPath);
    if (docPath === path.basename(currentPath)) {
        return 'current';
    }
    return docPath.replace(/\\/g, '/');
}
exports.getDocumentPath = getDocumentPath;
/**
 * Primary copied from the original VSCode CSS extension:
 * https://github.com/microsoft/vscode/blob/2bb6cfc16a88281b75cfdaced340308ff89a849e/extensions/css-language-features/server/src/utils/documentContext.ts
 */
function buildDocumentContext(base) {
    return {
        resolveReference: ref => new URL(ref, base).toString()
    };
}
exports.buildDocumentContext = buildDocumentContext;
