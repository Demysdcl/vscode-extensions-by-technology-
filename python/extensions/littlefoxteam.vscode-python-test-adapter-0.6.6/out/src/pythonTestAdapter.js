"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonTestAdapter = void 0;
const tslib_1 = require("tslib");
const vscode_1 = require("vscode");
const path = tslib_1.__importStar(require("path"));
const jsonc_parser_1 = require("jsonc-parser");
const fs_1 = require("./utilities/fs");
const collections_1 = require("./utilities/collections");
const environmentVariablesLoader_1 = require("./environmentVariablesLoader");
class PythonTestAdapter {
    constructor(workspaceFolder, testRunner, configurationFactory, logger) {
        this.workspaceFolder = workspaceFolder;
        this.testRunner = testRunner;
        this.configurationFactory = configurationFactory;
        this.logger = logger;
        this.disposables = [];
        this.testsEmitter = new vscode_1.EventEmitter();
        this.testStatesEmitter = new vscode_1.EventEmitter();
        this.autorunEmitter = new vscode_1.EventEmitter();
        this.testsById = new Map();
        this.testsByFsPath = new Map();
        this.disposables = [
            this.testsEmitter,
            this.testStatesEmitter,
            this.autorunEmitter
        ];
        this.registerActions();
    }
    get tests() { return this.testsEmitter.event; }
    get testStates() {
        return this.testStatesEmitter.event;
    }
    get autorun() {
        return this.autorunEmitter.event;
    }
    registerActions() {
        this.disposables.push(vscode_1.workspace.onDidChangeConfiguration((configurationChange) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const sectionsToReload = [
                'python.pythonPath',
                'python.envFile',
                'python.testing.cwd',
                'python.testing.unittestEnabled',
                'python.testing.unittestArgs',
                'python.testing.pytestEnabled',
                'python.testing.pytestPath',
                'python.testing.pytestArgs',
                'pythonTestExplorer.testFramework'
            ];
            const needsReload = sectionsToReload.some(section => configurationChange.affectsConfiguration(section, this.workspaceFolder.uri));
            if (needsReload) {
                this.logger.log('info', 'Configuration changed, reloading tests');
                this.load();
            }
        })));
        this.disposables.push(vscode_1.workspace.onDidSaveTextDocument((document) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const config = yield this.configurationFactory.get(this.workspaceFolder);
            if (config.autoTestDiscoverOnSaveEnabled()) {
                const filename = document.fileName;
                if (this.testsByFsPath.has(filename)) {
                    this.logger.log('debug', 'Test file changed, reloading tests');
                    yield this.load();
                    return;
                }
                if (filename.startsWith(this.workspaceFolder.uri.fsPath)) {
                    this.logger.log('debug', 'Sending autorun event');
                    this.autorunEmitter.fire();
                }
            }
        })));
    }
    load() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this.testsEmitter.fire({ type: 'started' });
                this.testsById.clear();
                this.testsByFsPath.clear();
                const config = yield this.configurationFactory.get(this.workspaceFolder);
                const suite = yield this.testRunner.load(config);
                this.saveToMap(suite);
                this.sortTests(suite);
                this.testsEmitter.fire({ type: 'finished', suite });
            }
            catch (error) {
                this.logger.log('crit', `Test loading failed: ${error}`);
                this.testsEmitter.fire({ type: 'finished', suite: undefined, errorMessage: error.stack });
            }
        });
    }
    run(tests) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            try {
                this.testStatesEmitter.fire({ type: 'started', tests });
                const config = yield this.configurationFactory.get(this.workspaceFolder);
                const testRuns = tests.map((test) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    try {
                        const states = yield this.testRunner.run(config, test);
                        return states.forEach(state => {
                            var _a;
                            const testId = state.test;
                            if (this.testsById.has(testId) && ((_a = this.testsById.get(testId)) === null || _a === void 0 ? void 0 : _a.type) === 'suite') {
                                this.setTestStatesRecursive(testId, state.state, state.message);
                            }
                            else {
                                this.testStatesEmitter.fire(state);
                            }
                        });
                    }
                    catch (reason) {
                        this.logger.log('crit', `Execution of the test "${test}" failed: ${reason}`);
                        this.setTestStatesRecursive(test, 'failed', reason);
                    }
                }));
                yield Promise.all(testRuns);
            }
            finally {
                this.testStatesEmitter.fire({ type: 'finished' });
            }
        });
    }
    debug(tests) {
        var _a;
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const config = yield this.configurationFactory.get(this.workspaceFolder);
            const debugConfiguration = yield this.testRunner.debugConfiguration(config, tests[0]);
            const launchJsonConfiguration = yield this.detectDebugConfiguration(((_a = this.testsById.get(tests[0])) === null || _a === void 0 ? void 0 : _a.label) || tests[0], debugConfiguration.env);
            return new Promise(() => {
                vscode_1.debug.startDebugging(this.workspaceFolder, Object.assign(Object.assign({
                    type: 'python',
                    request: 'launch',
                    console: 'internalConsole',
                }, debugConfiguration), launchJsonConfiguration)).then(() => { }, exception => this.logger.log('crit', `Failed to start debugging tests: ${exception}`));
            });
        });
    }
    cancel() {
        this.testRunner.cancel();
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
        this.disposables = [];
    }
    sortTests(test) {
        if (!test) {
            return;
        }
        test.children.sort((x, y) => x.label.localeCompare(y.label, undefined, { sensitivity: 'base', numeric: true }));
        test.children.filter(t => t)
            .filter(t => t.type === 'suite')
            .map(t => t)
            .forEach(t => this.sortTests(t));
    }
    saveToMap(test) {
        if (!test) {
            return;
        }
        this.testsById.set(test.id, test);
        if (test.file) {
            this.testsByFsPath.set(test.file, test);
        }
        if (test.type === 'suite') {
            test.children.forEach(child => this.saveToMap(child));
        }
    }
    setTestStatesRecursive(test, state, message) {
        const info = this.testsById.get(test);
        if (!info) {
            this.logger.log('warn', `Test information for "${test}" not found`);
            return;
        }
        if (info.type === 'suite') {
            info.children.forEach(child => this.setTestStatesRecursive(child.id, state, message));
        }
        else {
            this.testStatesEmitter.fire({
                type: 'test',
                test: info.id,
                state,
                message,
            });
        }
    }
    detectDebugConfiguration(test, globalEnvironment) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const emptyJsonConfiguration = {
                name: `Debug: ${test}`,
            };
            const filename = path.join(this.workspaceFolder.uri.fsPath, '.vscode', 'launch.json');
            const launchJsonFileExists = yield fs_1.isFileExists(filename);
            if (!launchJsonFileExists) {
                return emptyJsonConfiguration;
            }
            try {
                const content = yield fs_1.readFile(filename);
                const launchJsonConfiguration = jsonc_parser_1.parse(content, [], { allowTrailingComma: true, disallowComments: false });
                if (!launchJsonConfiguration.version || collections_1.empty(launchJsonConfiguration.configurations)) {
                    this.logger.log('warn', `No debug configurations in ${filename}`);
                }
                return collections_1.firstOrDefault(launchJsonConfiguration.configurations
                    .filter(cfg => cfg.name)
                    .filter(cfg => cfg.type === 'python')
                    .filter(cfg => cfg.request === 'test')
                    .map(cfg => cfg)
                    .map(cfg => ({
                    env: environmentVariablesLoader_1.EnvironmentVariablesLoader.merge(cfg.env || {}, globalEnvironment),
                    name: `${cfg.name}: ${test}`,
                    console: cfg.console,
                    stopOnEntry: cfg.stopOnEntry,
                    showReturnValue: cfg.showReturnValue,
                    redirectOutput: cfg.redirectOutput,
                    debugStdLib: cfg.debugStdLib,
                    justMyCode: cfg.justMyCode,
                    subProcess: cfg.subProcess,
                    envFile: cfg.envFile,
                })), emptyJsonConfiguration);
            }
            catch (error) {
                this.logger.log('crit', `Could not load debug configuration: ${error}`);
                return emptyJsonConfiguration;
            }
        });
    }
}
exports.PythonTestAdapter = PythonTestAdapter;
//# sourceMappingURL=pythonTestAdapter.js.map