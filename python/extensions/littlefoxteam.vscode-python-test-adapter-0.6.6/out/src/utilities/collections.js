"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinctBy = exports.groupBy = exports.firstOrDefault = exports.firstNotEmpty = exports.empty = void 0;
function empty(x) {
    return !x || !x.length;
}
exports.empty = empty;
function firstNotEmpty(fns, defaultValue) {
    for (const fn of fns) {
        const result = fn();
        if (result) {
            return result;
        }
    }
    return defaultValue;
}
exports.firstNotEmpty = firstNotEmpty;
function firstOrDefault(values, defaultValue) {
    if (empty(values)) {
        return defaultValue;
    }
    return values[0];
}
exports.firstOrDefault = firstOrDefault;
function groupBy(values, key) {
    return values.reduce((accumulator, x) => {
        if (accumulator.has(key(x))) {
            accumulator.get(key(x)).push(x);
        }
        else {
            accumulator.set(key(x), [x]);
        }
        return accumulator;
    }, new Map());
}
exports.groupBy = groupBy;
function distinctBy(values, key) {
    const byKey = new Map();
    values.forEach(x => {
        byKey.set(key(x), x);
    });
    return Array.from(byKey.values());
}
exports.distinctBy = distinctBy;
//# sourceMappingURL=collections.js.map