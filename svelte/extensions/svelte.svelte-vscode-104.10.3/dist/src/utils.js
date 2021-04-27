"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.btoa = exports.atob = void 0;
function atob(encoded) {
    const buffer = Buffer.from(encoded, 'base64');
    return buffer.toString('utf8');
}
exports.atob = atob;
function btoa(decoded) {
    const buffer = Buffer.from(decoded, 'utf8');
    return buffer.toString('base64');
}
exports.btoa = btoa;
//# sourceMappingURL=utils.js.map