"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLogger = void 0;
class DefaultLogger {
    constructor(output, workspaceFolder, framework) {
        this.output = output;
        this.workspaceFolder = workspaceFolder;
        this.framework = framework;
    }
    log(level, message) {
        try {
            this.output.write(`${new Date().toISOString()} ` +
                `${this.levelCode(level)} ` +
                `${this.framework} at '${this.workspaceFolder.name}': ` +
                `${message}`);
        }
        catch (_a) {
        }
    }
    levelCode(level) {
        switch (level) {
            case 'crit': return 'CRIT';
            case 'warn': return 'WARN';
            case 'info': return 'INFO';
            case 'debug': return ' DBG';
            default: return '?';
        }
    }
}
exports.DefaultLogger = DefaultLogger;
//# sourceMappingURL=defaultLogger.js.map