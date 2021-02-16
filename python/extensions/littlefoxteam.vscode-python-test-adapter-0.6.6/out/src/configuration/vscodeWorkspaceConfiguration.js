"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VscodeWorkspaceConfiguration = void 0;
const argparse_1 = require("argparse");
const vscode_1 = require("vscode");
const collections_1 = require("../utilities/collections");
class VscodeWorkspaceConfiguration {
    constructor(workspaceFolder) {
        this.workspaceFolder = workspaceFolder;
        this.unittestArgumentParser = this.configureUnittestArgumentParser();
        this.pythonConfiguration = this.getPythonConfiguration(workspaceFolder);
        this.testExplorerConfiguration = this.getTestExplorerConfiguration(workspaceFolder);
    }
    pythonPath() {
        return this.pythonConfiguration.get('pythonPath', 'python');
    }
    getCwd() {
        return this.getConfigurationValueOrDefault(this.pythonConfiguration, ['unitTest.cwd', 'testing.cwd'], this.workspaceFolder.uri.fsPath);
    }
    envFile() {
        return this.pythonConfiguration.get('envFile', '${workspaceFolder}/.env');
    }
    autoTestDiscoverOnSaveEnabled() {
        return this.pythonConfiguration.get('testing.autoTestDiscoverOnSaveEnabled', true);
    }
    getUnittestConfiguration() {
        return {
            isUnittestEnabled: this.isUnitTestEnabled(),
            unittestArguments: this.getUnitTestArguments(),
        };
    }
    getPytestConfiguration() {
        return {
            pytestPath: () => this.getPytestPath(),
            isPytestEnabled: this.isPytestTestEnabled(),
            pytestArguments: this.getPytestArguments(),
        };
    }
    getConfigurationValueOrDefault(configuration, keys, defaultValue) {
        return collections_1.firstNotEmpty(keys.map(key => (() => configuration.get(key))), defaultValue);
    }
    isUnitTestEnabled() {
        const overriddenTestFramework = this.testExplorerConfiguration.get('testFramework', null);
        if (overriddenTestFramework) {
            return 'unittest' === overriddenTestFramework;
        }
        return this.getConfigurationValueOrDefault(this.pythonConfiguration, ['unitTest.unittestEnabled', 'testing.unittestEnabled'], false);
    }
    getUnitTestArguments() {
        const [known] = this.unittestArgumentParser.parse_known_args(this.getConfigurationValueOrDefault(this.pythonConfiguration, ['unitTest.unittestArgs', 'testing.unittestArgs'], []));
        return known;
    }
    isPytestTestEnabled() {
        const overriddenTestFramework = this.testExplorerConfiguration.get('testFramework', null);
        if (overriddenTestFramework) {
            return 'pytest' === overriddenTestFramework;
        }
        return this.getConfigurationValueOrDefault(this.pythonConfiguration, ['unitTest.pyTestEnabled', 'testing.pyTestEnabled', 'testing.pytestEnabled'], false);
    }
    getPytestPath() {
        return this.getConfigurationValueOrDefault(this.pythonConfiguration, ['unitTest.pyTestPath', 'testing.pyTestPath', 'testing.pytestPath'], 'pytest');
    }
    getPytestArguments() {
        return this.getConfigurationValueOrDefault(this.pythonConfiguration, ['unitTest.pyTestArgs', 'testing.pyTestArgs', 'testing.pytestArgs'], []);
    }
    configureUnittestArgumentParser() {
        const argumentParser = new argparse_1.ArgumentParser({
            exit_on_error: false,
        });
        argumentParser.add_argument('-p', '--pattern', {
            dest: 'pattern',
            default: 'test*.py',
        });
        argumentParser.add_argument('-s', '--start-directory', {
            dest: 'startDirectory',
            default: '.',
        });
        return argumentParser;
    }
    getConfigurationByName(name, workspaceFolder) {
        return vscode_1.workspace.getConfiguration(name, workspaceFolder.uri);
    }
    getPythonConfiguration(workspaceFolder) {
        return this.getConfigurationByName('python', workspaceFolder);
    }
    getTestExplorerConfiguration(workspaceFolder) {
        return this.getConfigurationByName('pythonTestExplorer', workspaceFolder);
    }
}
exports.VscodeWorkspaceConfiguration = VscodeWorkspaceConfiguration;
//# sourceMappingURL=vscodeWorkspaceConfiguration.js.map