"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runProcess = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const iconv = tslib_1.__importStar(require("iconv-lite"));
const os_1 = require("os");
class CommandProcessExecution {
    constructor(command, args, configuration) {
        this.commandProcess = child_process_1.spawn(command, args, {
            cwd: configuration === null || configuration === void 0 ? void 0 : configuration.cwd,
            env: Object.assign(Object.assign({}, process.env), configuration === null || configuration === void 0 ? void 0 : configuration.environment),
        });
        this.pid = this.commandProcess.pid;
        this.acceptedExitCodes = (configuration === null || configuration === void 0 ? void 0 : configuration.acceptedExitCodes) || [0];
    }
    complete() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const stdoutBuffer = [];
                const stderrBuffer = [];
                this.commandProcess.stdout.on('data', chunk => stdoutBuffer.push(chunk));
                this.commandProcess.stderr.on('data', chunk => stderrBuffer.push(chunk));
                this.commandProcess.once('close', exitCode => {
                    if (this.acceptedExitCodes.indexOf(exitCode) < 0 && !this.commandProcess.killed) {
                        reject(new Error(`Process exited with code ${exitCode}: ${decode(stderrBuffer)}`));
                        return;
                    }
                    const output = decode(stdoutBuffer);
                    if (!output) {
                        if (stdoutBuffer.length > 0) {
                            reject(new Error('Can not decode output from the process'));
                        }
                        else if (stderrBuffer.length > 0 && !this.commandProcess.killed) {
                            reject(new Error(`Process returned an error:${os_1.EOL}${decode(stderrBuffer)}`));
                        }
                    }
                    resolve({ exitCode, output });
                });
                this.commandProcess.once('error', error => {
                    reject(new Error(`Error occurred during process execution: ${error}`));
                });
            });
        });
    }
    cancel() {
        this.commandProcess.kill('SIGINT');
    }
}
function runProcess(command, args, configuration) {
    return new CommandProcessExecution(command, args, configuration);
}
exports.runProcess = runProcess;
function decode(buffers) {
    return iconv.decode(Buffer.concat(buffers), 'utf8');
}
//# sourceMappingURL=processRunner.js.map