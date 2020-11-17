"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const yp = require("yaml-ast-parser");
const _ = require("lodash");
class JsonALikeYamlDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        return this.provideDocumentSymbolsImpl(document, token);
    }
    provideDocumentSymbolsImpl(document, _token) {
        return __awaiter(this, void 0, void 0, function* () {
            const fakeText = document.getText().replace(/{{[^}]*}}/g, (s) => encodeWithTemplateMarkers(s));
            const root = yp.safeLoad(fakeText);
            const syms = [];
            walk(root, '', document, document.uri, syms);
            return syms;
        });
    }
}
exports.JsonALikeYamlDocumentSymbolProvider = JsonALikeYamlDocumentSymbolProvider;
// These MUST be the same lengths as the strings they replace
// ('{{', '}}' and '"'") - we rely on the text ranges staying
// the same in order to detect and substitute back the actual
// template expression.
const ENCODE_TEMPLATE_START = 'AA';
const ENCODE_TEMPLATE_END = 'ZZ';
const ENCODE_TEMPLATE_QUOTE = 'Q';
// This is pretty horrible, but the YAML parser can't handle embedded Go template
// expressions.  So we transform Go template expressions to (reasonably) distinctive
// strings with the EXACT SAME position and length, run the YAML parser, then when we
// construct the Helm AST, if we see such a string we check back to the original YAML
// document to fix it up if necessary.
function encodeWithTemplateMarkers(s) {
    return s.replace(/{{/g, ENCODE_TEMPLATE_START)
        .replace(/}}/g, ENCODE_TEMPLATE_END)
        .replace(/"/g, ENCODE_TEMPLATE_QUOTE);
}
function findKeyPath(keyPath, sis) {
    return findKeyPathAcc(keyPath, sis, undefined);
}
exports.findKeyPath = findKeyPath;
function findKeyPathAcc(keyPath, sis, acc) {
    const parentSym = findKey(keyPath[0], sis);
    if (!parentSym) {
        return { found: acc, remaining: keyPath };
    }
    if (keyPath.length === 1) {
        return { found: parentSym, remaining: [] };
    }
    const childSyms = sis.filter((s) => parentSym.location.range.contains(s.location.range));
    return findKeyPathAcc(keyPath.slice(1), childSyms, parentSym);
}
function findKey(key, sis) {
    const fields = sis.filter((si) => si.kind === vscode.SymbolKind.Field && si.name === key);
    if (fields.length === 0) {
        return undefined;
    }
    return outermost(fields);
}
function outermost(sis) {
    return _.maxBy(sis, (s) => containmentChain(s, sis)); // safe because sis wil not be empty
}
function containmentChain(s, sis) {
    const containers = sis.filter((si) => si.kind === vscode.SymbolKind.Field)
        .filter((si) => si.location.range.contains(s.location.range))
        .filter((si) => si !== s);
    if (containers.length === 0) {
        return [];
    }
    const nextUp = minimalSymbol(containers);
    const fromThere = containmentChain(nextUp, sis);
    return [nextUp, ...fromThere];
}
exports.containmentChain = containmentChain;
function symbolAt(position, sis) {
    const containers = sis.filter((si) => si.location.range.contains(position));
    if (containers.length === 0) {
        return undefined;
    }
    return minimalSymbol(containers);
}
exports.symbolAt = symbolAt;
function minimalSymbol(sis) {
    let m = sis[0];
    for (const si of sis) {
        if (m.location.range.contains(si.location.range)) {
            m = si;
        }
    }
    return m;
}
function symbolInfo(node, containerName, d, uri) {
    const start = node.startPosition;
    const end = node.endPosition;
    const loc = new vscode.Location(uri, new vscode.Range(d.positionAt(start), d.positionAt(end)));
    switch (node.kind) {
        case yp.Kind.ANCHOR_REF:
            return [];
        case yp.Kind.INCLUDE_REF:
            return [];
        case yp.Kind.MAP:
            return [];
        case yp.Kind.MAPPING:
            const mp = node;
            let sk = vscode.SymbolKind.String;
            switch (mp.value.kind) {
                case yp.Kind.MAP:
                    sk = vscode.SymbolKind.Module;
                    break; // go figure
                case yp.Kind.MAPPING:
                    sk = vscode.SymbolKind.Object;
                    break;
                case yp.Kind.SEQ:
                    sk = vscode.SymbolKind.Array;
                    break;
            }
            return [new vscode.SymbolInformation(`${mp.key.rawValue}`, sk, containerName, loc)];
        case yp.Kind.SCALAR:
            return [];
        case yp.Kind.SEQ:
            return [];
    }
    return [];
}
function walk(node, containerName, d, uri, syms) {
    const sym = symbolInfo(node, containerName, d, uri);
    syms.push(...sym);
    switch (node.kind) {
        case yp.Kind.ANCHOR_REF:
            return;
        case yp.Kind.INCLUDE_REF:
            return;
        case yp.Kind.MAP:
            const m = node;
            for (const mm of m.mappings) {
                walk(mm, containerName, d, uri, syms);
            }
            return;
        case yp.Kind.MAPPING:
            const mp = node;
            if (mp.value) {
                walk(mp.value, `${containerName}${containerName ? '.' : ''}${sym[0].name}`, d, uri, syms);
            }
            return;
        case yp.Kind.SCALAR:
            return;
        case yp.Kind.SEQ:
            const s = node;
            for (const y of s.items) {
                walk(y, containerName, d, uri, syms);
            }
            return;
    }
}
//# sourceMappingURL=jsonalike-symbol-provider.js.map