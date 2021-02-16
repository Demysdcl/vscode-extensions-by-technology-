"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaceholderAwareWorkspaceConfiguration = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const untildify_1 = tslib_1.__importDefault(require("untildify"));
class PlaceholderAwareWorkspaceConfiguration {
    constructor(configuration, workspaceFolder, logger) {
        this.configuration = configuration;
        this.workspaceFolder = workspaceFolder;
        this.logger = logger;
    }
    pythonPath() {
        return this.resolveExecutablePath(this.configuration.pythonPath());
    }
    getCwd() {
        return this.resolvePath(this.configuration.getCwd());
    }
    envFile() {
        return this.resolvePath(this.configuration.envFile());
    }
    autoTestDiscoverOnSaveEnabled() {
        return this.configuration.autoTestDiscoverOnSaveEnabled();
    }
    getUnittestConfiguration() {
        const original = this.configuration.getUnittestConfiguration();
        return {
            isUnittestEnabled: original.isUnittestEnabled,
            unittestArguments: {
                pattern: this.resolvePlaceholders(original.unittestArguments.pattern),
                startDirectory: this.resolvePath(original.unittestArguments.startDirectory),
            },
        };
    }
    getPytestConfiguration() {
        const original = this.configuration.getPytestConfiguration();
        return {
            pytestPath: () => this.getPytestPath(),
            isPytestEnabled: original.isPytestEnabled,
            pytestArguments: original.pytestArguments.map(argument => this.resolvePlaceholders(argument)),
        };
    }
    getPytestPath() {
        return this.resolveExecutablePath(this.configuration.getPytestConfiguration().pytestPath());
    }
    resolvePlaceholders(rawValue) {
        const availableReplacements = new Map();
        availableReplacements.set('workspaceFolder', this.workspaceFolder.uri.fsPath);
        availableReplacements.set('workspaceRoot', this.workspaceFolder.uri.fsPath);
        availableReplacements.set('workspaceFolderBasename', path.basename(this.workspaceFolder.uri.fsPath));
        availableReplacements.set('workspaceRootFolderName', path.basename(this.workspaceFolder.uri.fsPath));
        availableReplacements.set('cwd', this.workspaceFolder.uri.fsPath);
        Object.keys(process.env)
            .filter(key => process.env[key])
            .forEach(key => {
            availableReplacements.set(`env:${key}`, process.env[key]);
        });
        const regexp = /\$\{(.*?)\}/g;
        return rawValue.replace(regexp, (match, name) => {
            const replacement = availableReplacements.get(name);
            if (replacement) {
                return replacement;
            }
            this.logger.log('warn', `Placeholder ${match} was not recognized and can not be replaced.`);
            return match;
        });
    }
    resolveExecutablePath(rawValue) {
        return this.normalizeExecutablePath(this.resolvePlaceholders(rawValue));
    }
    resolvePath(rawValue) {
        return this.normalizePath(this.resolvePlaceholders(rawValue));
    }
    normalizeExecutablePath(originalValue) {
        const value = untildify_1.default(originalValue);
        if (value.includes(path.posix.sep) || value.includes(path.win32.sep)) {
            const absolutePath = path.isAbsolute(value) ?
                path.resolve(value) :
                path.resolve(this.workspaceFolder.uri.fsPath, value);
            return path.normalize(absolutePath);
        }
        return value;
    }
    normalizePath(originalValue) {
        const value = untildify_1.default(originalValue);
        const absolutePath = path.isAbsolute(value) ?
            path.resolve(value) :
            path.resolve(this.workspaceFolder.uri.fsPath, value);
        return path.normalize(absolutePath);
    }
}
exports.PlaceholderAwareWorkspaceConfiguration = PlaceholderAwareWorkspaceConfiguration;
//# sourceMappingURL=placeholderAwareWorkspaceConfiguration.js.map