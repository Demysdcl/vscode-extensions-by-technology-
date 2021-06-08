"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const path = require("path");
const Mocha = require("mocha");
const fg = require("fast-glob");
const ONE_SECOND_IN_MS = 1 * 1000;
async function run() {
    const mocha = new Mocha({
        ui: 'bdd',
        timeout: ONE_SECOND_IN_MS * 10
    });
    const files = await fg('**/*.test.js', {
        cwd: path.resolve(__dirname, '..'),
        absolute: true
    });
    // Add files to the test suite
    files.forEach(file => mocha.addFile(file));
    return new Promise((resolve, reject) => {
        mocha.run(failures => {
            if (failures === 0) {
                return resolve();
            }
            const error = new Error(`${failures} tests failed.`);
            reject(error);
        });
    });
}
exports.run = run;
