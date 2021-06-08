'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentNodeByType = exports.getNodeAtOffset = void 0;
const nodes_1 = require("../types/nodes");
/**
 * Get Node by offset position.
 */
function getNodeAtOffset(parsedDocument, posOffset) {
    let candidate = null;
    parsedDocument.accept(node => {
        if (node.offset === -1 && node.length === -1) {
            return true;
        }
        else if (posOffset !== null && node.offset <= posOffset && node.end >= posOffset) {
            if (!candidate) {
                candidate = node;
            }
            else if (node.length <= candidate.length) {
                candidate = node;
            }
            return true;
        }
        return false;
    });
    return candidate;
}
exports.getNodeAtOffset = getNodeAtOffset;
/**
 * Returns the parent Node of the specified type.
 */
function getParentNodeByType(node, type) {
    if (node === null) {
        return null;
    }
    node = node.getParent();
    while (node.type !== type) {
        if (node.type === nodes_1.NodeType.Stylesheet) {
            return null;
        }
        node = node.getParent();
    }
    return node;
}
exports.getParentNodeByType = getParentNodeByType;
