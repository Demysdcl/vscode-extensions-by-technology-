"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFile = exports.isFileExists = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
function isFileExists(file) {
    return new Promise((resolve, _) => {
        fs.exists(file, exist => {
            resolve(exist);
        });
    });
}
exports.isFileExists = isFileExists;
function readFile(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, 'utf-8', (error, content) => {
            if (error) {
                reject(error);
            }
            resolve(content);
        });
    });
}
exports.readFile = readFile;
//# sourceMappingURL=fs.js.map