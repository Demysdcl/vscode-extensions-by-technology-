"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultConfigurationFactory = void 0;
const tslib_1 = require("tslib");
const placeholderAwareWorkspaceConfiguration_1 = require("./placeholderAwareWorkspaceConfiguration");
const pythonExtensionAwareWorkspaceConfiguration_1 = require("./pythonExtensionAwareWorkspaceConfiguration");
const vscodeWorkspaceConfiguration_1 = require("./vscodeWorkspaceConfiguration");
class DefaultConfigurationFactory {
    constructor(logger) {
        this.logger = logger;
    }
    get(workspaceFolder) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.logger.log('info', `Reading configuration for workspace ${workspaceFolder.name}`);
            return yield pythonExtensionAwareWorkspaceConfiguration_1.PythonExtensionAwareWorkspaceConfiguration.for(new placeholderAwareWorkspaceConfiguration_1.PlaceholderAwareWorkspaceConfiguration(new vscodeWorkspaceConfiguration_1.VscodeWorkspaceConfiguration(workspaceFolder), workspaceFolder, this.logger), workspaceFolder, this.logger);
        });
    }
}
exports.DefaultConfigurationFactory = DefaultConfigurationFactory;
//# sourceMappingURL=configurationFactory.js.map