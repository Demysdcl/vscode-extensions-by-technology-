'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.doHover = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const nodes_1 = require("../types/nodes");
const parser_1 = require("../services/parser");
const symbols_1 = require("../utils/symbols");
const document_1 = require("../utils/document");
const string_1 = require("../utils/string");
function formatVariableMarkupContent(symbol, fsPath, suffix) {
    const value = string_1.getLimitedString(symbol.value || '');
    if (fsPath !== 'current') {
        suffix = `\n@import "${fsPath}"` + suffix;
    }
    return {
        kind: vscode_languageserver_1.MarkupKind.Markdown,
        value: [
            '```scss',
            `${symbol.name}: ${value};${suffix}`,
            '```'
        ].join('\n')
    };
}
function formatMixinMarkupContent(symbol, fsPath, suffix) {
    const args = symbol.parameters.map(item => `${item.name}: ${item.value}`).join(', ');
    if (fsPath !== 'current') {
        suffix = `\n@import "${fsPath}"` + suffix;
    }
    return {
        kind: vscode_languageserver_1.MarkupKind.Markdown,
        value: [
            '```scss',
            `@mixin ${symbol.name}(${args}) {\u2026}${suffix}`,
            '```'
        ].join('\n')
    };
}
function formatFunctionMarkupContent(symbol, fsPath, suffix) {
    const args = symbol.parameters.map(item => `${item.name}: ${item.value}`).join(', ');
    if (fsPath !== 'current') {
        suffix = `\n@import "${fsPath}"` + suffix;
    }
    return {
        kind: vscode_languageserver_1.MarkupKind.Markdown,
        value: [
            '```scss',
            `@function ${symbol.name}(${args}) {\u2026}${suffix}`,
            '```'
        ].join('\n')
    };
}
/**
 * Returns the Symbol, if it present in the documents.
 */
function getSymbol(symbolList, identifier, currentPath) {
    for (let i = 0; i < symbolList.length; i++) {
        if (identifier.type === 'imports') {
            continue;
        }
        const symbols = symbolList[i];
        if (symbols === undefined) {
            continue;
        }
        const symbolsByType = symbols[identifier.type];
        const fsPath = document_1.getDocumentPath(currentPath, symbols.filepath || symbols.document);
        for (let j = 0; j < symbolsByType.length; j++) {
            const symbol = symbolsByType[j];
            if (symbol && symbol.name === identifier.name) {
                return {
                    document: symbols.document,
                    path: fsPath,
                    info: symbol
                };
            }
        }
    }
    return null;
}
async function doHover(document, offset, storage) {
    const documentPath = vscode_uri_1.URI.parse(document.uri).fsPath;
    const resource = await parser_1.parseDocument(document, offset);
    const hoverNode = resource.node;
    if (!hoverNode || !hoverNode.type) {
        return null;
    }
    let identifier = null;
    if (hoverNode.type === nodes_1.NodeType.VariableName) {
        const parent = hoverNode.getParent();
        if (parent.type !== nodes_1.NodeType.VariableDeclaration && parent.type !== nodes_1.NodeType.FunctionParameter) {
            identifier = {
                name: hoverNode.getName(),
                type: 'variables'
            };
        }
    }
    else if (hoverNode.type === nodes_1.NodeType.Identifier) {
        let node;
        let type = null;
        const parent = hoverNode.getParent();
        if (parent.type === nodes_1.NodeType.Function) {
            node = parent;
            type = 'functions';
        }
        else if (parent.type === nodes_1.NodeType.MixinReference) {
            node = parent;
            type = 'mixins';
        }
        if (type === null) {
            return null;
        }
        if (node) {
            identifier = {
                name: node.getName(),
                type
            };
        }
    }
    else if (hoverNode.type === nodes_1.NodeType.MixinReference) {
        identifier = {
            name: hoverNode.getName(),
            type: 'mixins'
        };
    }
    if (!identifier) {
        return null;
    }
    storage.set(document.uri, resource.symbols);
    const symbolsList = symbols_1.getSymbolsCollection(storage);
    const documentImports = resource.symbols.imports.map(x => x.filepath);
    const symbol = getSymbol(symbolsList, identifier, documentPath);
    // Content for Hover popup
    let contents;
    if (symbol && symbol.document !== undefined) {
        // Add 'implicitly' suffix if the file imported implicitly
        let contentSuffix = '';
        if (symbol.path !== 'current' && symbol.document && documentImports.indexOf(symbol.document) === -1) {
            contentSuffix = ' (implicitly)';
        }
        if (identifier.type === 'variables') {
            contents = formatVariableMarkupContent(symbol.info, symbol.path, contentSuffix);
        }
        else if (identifier.type === 'mixins') {
            contents = formatMixinMarkupContent(symbol.info, symbol.path, contentSuffix);
        }
        else if (identifier.type === 'functions') {
            contents = formatFunctionMarkupContent(symbol.info, symbol.path, contentSuffix);
        }
    }
    if (contents === undefined) {
        return null;
    }
    return {
        contents
    };
}
exports.doHover = doHover;
