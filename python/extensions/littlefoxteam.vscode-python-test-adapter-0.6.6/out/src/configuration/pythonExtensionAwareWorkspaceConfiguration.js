"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonExtensionAwareWorkspaceConfiguration = void 0;
const tslib_1 = require("tslib");
const vscode_1 = require("vscode");
const os_1 = require("os");
const MS_PYTHON_EXTENSION_ID = 'ms-python.python';
class PythonExtensionAwareWorkspaceConfiguration {
    constructor(configuration, workspaceFolder, detectedPythonPath) {
        this.configuration = configuration;
        this.workspaceFolder = workspaceFolder;
        this.detectedPythonPath = detectedPythonPath;
    }
    static for(configuration, workspaceFolder, logger) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const detectedPythonPath = yield PythonExtensionAwareWorkspaceConfiguration.detectPythonPath(workspaceFolder, logger);
            return new PythonExtensionAwareWorkspaceConfiguration(configuration, workspaceFolder, detectedPythonPath);
        });
    }
    static detectPythonPath(workspaceFolder, logger) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                return yield PythonExtensionAwareWorkspaceConfiguration
                    .tryDetectPythonPath(workspaceFolder, logger);
            }
            catch (error) {
                logger.log('crit', `Failed to use pythonPath auto-detection from Python Extension: ${error}${os_1.EOL}${error.stack}`);
            }
            return undefined;
        });
    }
    static tryDetectPythonPath(workspaceFolder, logger) {
        var _a, _b;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const extension = vscode_1.extensions.getExtension(MS_PYTHON_EXTENSION_ID);
            if (!extension) {
                logger.log('debug', `Extension ${MS_PYTHON_EXTENSION_ID} not found, skipping pythonPath auto-detection`);
                return undefined;
            }
            const usingNewInterpreterStorage = (_b = (_a = extension.packageJSON) === null || _a === void 0 ? void 0 : _a.featureFlags) === null || _b === void 0 ? void 0 : _b.usingNewInterpreterStorage;
            logger.log('debug', `usingNewInterpreterStorage feature flag is '${usingNewInterpreterStorage}'`);
            if (usingNewInterpreterStorage) {
                if (!extension.isActive) {
                    yield extension.activate();
                }
                yield extension.exports.ready;
                const pythonPath = extension.exports.settings.getExecutionDetails(workspaceFolder.uri).execCommand[0];
                logger.log('info', `Using auto-detected pythonPath ${pythonPath}`);
                return pythonPath;
            }
            return undefined;
        });
    }
    pythonPath() {
        return this.detectedPythonPath || this.configuration.pythonPath();
    }
    getCwd() {
        return this.configuration.getCwd();
    }
    envFile() {
        return this.configuration.envFile();
    }
    autoTestDiscoverOnSaveEnabled() {
        return this.configuration.autoTestDiscoverOnSaveEnabled();
    }
    getUnittestConfiguration() {
        return this.configuration.getUnittestConfiguration();
    }
    getPytestConfiguration() {
        return this.configuration.getPytestConfiguration();
    }
}
exports.PythonExtensionAwareWorkspaceConfiguration = PythonExtensionAwareWorkspaceConfiguration;
//# sourceMappingURL=pythonExtensionAwareWorkspaceConfiguration.js.map