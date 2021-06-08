'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchWorkspaceSymbol = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const vscode_uri_1 = require("vscode-uri");
const symbols_1 = require("../utils/symbols");
async function searchWorkspaceSymbol(query, storage, root) {
    const workspaceSymbols = [];
    symbols_1.getSymbolsCollection(storage).forEach(symbols => {
        if (symbols.filepath === undefined) {
            return;
        }
        const documentUri = vscode_uri_1.URI.file(symbols.filepath);
        if (!documentUri.fsPath.includes(root)) {
            return;
        }
        const types = ['variables', 'mixins', 'functions'];
        types.forEach(type => {
            let kind = vscode_languageserver_1.SymbolKind.Variable;
            if (type === 'mixins') {
                kind = vscode_languageserver_1.SymbolKind.Function;
            }
            else if (type === 'functions') {
                kind = vscode_languageserver_1.SymbolKind.Interface;
            }
            if (type === 'imports') {
                return;
            }
            for (const symbol of symbols[type]) {
                if (!symbol.name.includes(query) || symbol.position === undefined) {
                    continue;
                }
                workspaceSymbols.push({
                    name: symbol.name,
                    kind,
                    location: {
                        uri: documentUri.toString(),
                        range: {
                            start: symbol.position,
                            end: {
                                line: symbol.position.line,
                                character: symbol.position.character + symbol.name.length
                            }
                        }
                    }
                });
            }
        });
    });
    return workspaceSymbols;
}
exports.searchWorkspaceSymbol = searchWorkspaceSymbol;
