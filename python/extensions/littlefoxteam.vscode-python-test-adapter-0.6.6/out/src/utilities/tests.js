"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDescriptionForEqualLabels = exports.getTestOutputBySplittingString = void 0;
const collections_1 = require("./collections");
function getTestOutputBySplittingString(output, stringToSplitWith) {
    const split = output.split(stringToSplitWith);
    return split && split.pop() || '';
}
exports.getTestOutputBySplittingString = getTestOutputBySplittingString;
function setDescriptionForEqualLabels(values, idSeparator) {
    const updatedLabels = mapUniqueLabelsById(values.filter(v => v.id.endsWith(v.label))
        .map(v => (Object.assign(Object.assign({}, v), { prefix: '' }))), idSeparator);
    values.filter(v => updatedLabels.has(v.id))
        .filter(v => updatedLabels.get(v.id).prefix)
        .forEach(v => {
        v.description = `${updatedLabels.get(v.id).prefix}`;
    });
}
exports.setDescriptionForEqualLabels = setDescriptionForEqualLabels;
function mapUniqueLabelsById(values, idSeparator) {
    const uniqueLabelsById = new Map();
    const labelGroups = collections_1.groupBy(values, v => prependPrefix(v.prefix, idSeparator, v.label));
    Array.from(labelGroups.entries())
        .filter(([_, group]) => group.length > 1)
        .map(([label, group]) => {
        const extendedPrefixGroup = group.map(v => {
            const idPrefix = v.id.substring(0, v.id.length - label.length - idSeparator.length);
            const labelPrefix = extractLastElement(idPrefix.split(idSeparator));
            return {
                id: v.id,
                prefix: v.prefix ? prependPrefix(labelPrefix, idSeparator, v.prefix) : labelPrefix,
                label: v.label,
            };
        });
        extendedPrefixGroup.forEach(v => uniqueLabelsById.set(v.id, v));
        mapUniqueLabelsById(extendedPrefixGroup, idSeparator).forEach((v, k) => uniqueLabelsById.set(k, v));
    });
    return uniqueLabelsById;
}
function prependPrefix(prefix, idSeparator, value) {
    return (prefix ? prefix + idSeparator : '') + value;
}
function extractLastElement(values) {
    if (collections_1.empty(values)) {
        return undefined;
    }
    return values[values.length - 1];
}
//# sourceMappingURL=tests.js.map