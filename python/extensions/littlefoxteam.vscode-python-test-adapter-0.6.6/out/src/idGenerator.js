"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextId = void 0;
function* infiniteNumberGenerator() {
    for (let i = 1; i < Number.MAX_SAFE_INTEGER; i++) {
        yield i++;
    }
}
const idGenerator = infiniteNumberGenerator();
function nextId() {
    const value = idGenerator.next();
    if (value.done) {
        throw new Error('Generator reached an end');
    }
    return value.value.toString().padStart(16, '0');
}
exports.nextId = nextId;
//# sourceMappingURL=idGenerator.js.map