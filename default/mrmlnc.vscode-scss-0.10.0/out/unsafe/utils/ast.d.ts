import { INode, NodeType } from '../types/nodes';
/**
 * Get Node by offset position.
 */
export declare function getNodeAtOffset(parsedDocument: INode, posOffset: number | null): INode | null;
/**
 * Returns the parent Node of the specified type.
 */
export declare function getParentNodeByType(node: INode | null, type: NodeType): INode | null;
