"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PytestTestRunner = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const tmp = tslib_1.__importStar(require("tmp"));
const argparse_1 = require("argparse");
const environmentVariablesLoader_1 = require("../environmentVariablesLoader");
const processRunner_1 = require("../processRunner");
const collections_1 = require("../utilities/collections");
const tests_1 = require("../utilities/tests");
const pytestJunitTestStatesParser_1 = require("./pytestJunitTestStatesParser");
const pytestTestCollectionParser_1 = require("./pytestTestCollectionParser");
const pythonRunner_1 = require("../pythonRunner");
const PYTEST_NON_ERROR_EXIT_CODES = [0, 1, 2, 5];
const DISCOVERY_OUTPUT_PLUGIN_INFO = {
    PACKAGE_PATH: path.resolve(__dirname, '../../resources/python'),
    MODULE_NAME: 'vscode_python_test_adapter.pytest.discovery_output_plugin',
};
class PytestTestRunner {
    constructor(adapterId, logger) {
        this.adapterId = adapterId;
        this.logger = logger;
        this.testExecutions = new Map();
    }
    cancel() {
        this.testExecutions.forEach((execution, test) => {
            this.logger.log('info', `Cancelling execution of ${test}`);
            try {
                execution.cancel();
            }
            catch (error) {
                this.logger.log('crit', `Cancelling execution of ${test} failed: ${error}`);
            }
        });
    }
    debugConfiguration(config, test) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const additionalEnvironment = yield this.loadEnvironmentVariables(config);
            const runArguments = this.getRunArguments(test, config.getPytestConfiguration().pytestArguments);
            return {
                module: 'pytest',
                cwd: config.getCwd(),
                args: runArguments.argumentsToPass,
                env: additionalEnvironment,
            };
        });
    }
    load(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!config.getPytestConfiguration().isPytestEnabled) {
                this.logger.log('info', 'Pytest test discovery is disabled');
                return undefined;
            }
            const additionalEnvironment = yield this.loadEnvironmentVariables(config);
            this.logger.log('info', `Discovering tests using python path '${config.pythonPath()}' in ${config.getCwd()}`);
            const discoveryArguments = this.getDiscoveryArguments(config.getPytestConfiguration().pytestArguments);
            this.logger.log('info', `Running pytest with arguments: ${discoveryArguments.join(', ')}`);
            const result = yield this.runPytest(config, additionalEnvironment, discoveryArguments).complete();
            const tests = pytestTestCollectionParser_1.parseTestSuites(result.output, config.getCwd());
            if (collections_1.empty(tests)) {
                this.logger.log('warn', 'No tests discovered');
                return undefined;
            }
            tests_1.setDescriptionForEqualLabels(tests, path.sep);
            return {
                type: 'suite',
                id: this.adapterId,
                label: 'Pytest tests',
                children: tests,
            };
        });
    }
    run(config, test) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!config.getPytestConfiguration().isPytestEnabled) {
                this.logger.log('info', 'Pytest test execution is disabled');
                return [];
            }
            this.logger.log('info', `Running tests using python path '${config.pythonPath()}' in ${config.getCwd()}`);
            const additionalEnvironment = yield this.loadEnvironmentVariables(config);
            const runArguments = this.getRunArguments(test, config.getPytestConfiguration().pytestArguments);
            const { file, cleanupCallback } = yield this.getJunitReportPath(config.getCwd(), runArguments);
            const testRunArguments = [
                `--rootdir=${config.getCwd()}`,
                `--junitxml=${file}`,
                '--override-ini', 'junit_logging=all',
                '--override-ini', 'junit_family=xunit1'
            ].concat(runArguments.argumentsToPass);
            this.logger.log('info', `Running pytest with arguments: ${testRunArguments.join(', ')}`);
            const testExecution = this.runPytest(config, additionalEnvironment, testRunArguments);
            this.testExecutions.set(test, testExecution);
            yield testExecution.complete();
            this.testExecutions.delete(test);
            this.logger.log('info', 'Test execution completed');
            const states = yield pytestJunitTestStatesParser_1.parseTestStates(file, config.getCwd());
            cleanupCallback();
            return states;
        });
    }
    runPytest(config, env, args) {
        const pytestPath = config.getPytestConfiguration().pytestPath();
        if (pytestPath === path.basename(pytestPath)) {
            this.logger.log('info', `Running ${pytestPath} as a Python module`);
            return pythonRunner_1.runModule({
                pythonPath: config.pythonPath(),
                module: config.getPytestConfiguration().pytestPath(),
                environment: env,
                args,
                cwd: config.getCwd(),
                acceptedExitCodes: PYTEST_NON_ERROR_EXIT_CODES,
            });
        }
        this.logger.log('info', `Running ${pytestPath} as an executable`);
        return processRunner_1.runProcess(pytestPath, args, {
            cwd: config.getCwd(),
            environment: env,
            acceptedExitCodes: PYTEST_NON_ERROR_EXIT_CODES,
        });
    }
    loadEnvironmentVariables(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const environment = yield environmentVariablesLoader_1.EnvironmentVariablesLoader.load(config.envFile(), process.env, this.logger);
            const updatedPythonPath = [
                config.getCwd(),
                environment.PYTHONPATH,
                DISCOVERY_OUTPUT_PLUGIN_INFO.PACKAGE_PATH
            ].filter(item => item).join(path.delimiter);
            const updatedPytestPlugins = [
                environment.PYTEST_PLUGINS,
                DISCOVERY_OUTPUT_PLUGIN_INFO.MODULE_NAME
            ].filter(item => item).join(',');
            return Object.assign(Object.assign({}, environment), { PYTHONPATH: updatedPythonPath, PYTEST_PLUGINS: updatedPytestPlugins });
        });
    }
    getJunitReportPath(cwd, runArguments) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (runArguments.junitReportPath) {
                return Promise.resolve({
                    file: path.resolve(cwd, runArguments.junitReportPath),
                    cleanupCallback: () => { },
                });
            }
            return yield this.createTemporaryFile();
        });
    }
    getDiscoveryArguments(rawPytestArguments) {
        const argumentParser = this.configureCommonArgumentParser();
        const [, argumentsToPass] = argumentParser.parse_known_args(rawPytestArguments);
        return ['--collect-only'].concat(argumentsToPass);
    }
    getRunArguments(test, rawPytestArguments) {
        const argumentParser = this.configureCommonArgumentParser();
        argumentParser.add_argument('--setuponly', '--setup-only', { action: 'store_true' });
        argumentParser.add_argument('--setupshow', '--setup-show', { action: 'store_true' });
        argumentParser.add_argument('--setupplan', '--setup-plan', { action: 'store_true' });
        argumentParser.add_argument('--collectonly', '--collect-only', { action: 'store_true' });
        argumentParser.add_argument('--trace', { dest: 'trace', action: 'store_true' });
        argumentParser.add_argument('tests', { nargs: '*' });
        const [knownArguments, argumentsToPass] = argumentParser.parse_known_args(rawPytestArguments);
        return {
            junitReportPath: knownArguments.xmlpath,
            argumentsToPass: argumentsToPass.concat(test !== this.adapterId ?
                [test] :
                knownArguments.tests || []),
        };
    }
    configureCommonArgumentParser() {
        const argumentParser = new argparse_1.ArgumentParser({
            exit_on_error: false,
        });
        argumentParser.add_argument('--rootdir', { action: 'store', dest: 'rootdir' });
        argumentParser.add_argument('-x', '--exitfirst', { dest: 'maxfail', action: 'store_const', const: 1 });
        argumentParser.add_argument('--maxfail', { dest: 'maxfail', action: 'store', default: 0 });
        argumentParser.add_argument('--fixtures', '--funcargs', { action: 'store_true', dest: 'showfixtures', default: false });
        argumentParser.add_argument('--fixtures-per-test', { action: 'store_true', dest: 'show_fixtures_per_test', default: false });
        argumentParser.add_argument('--lf', '--last-failed', { action: 'store_true', dest: 'lf' });
        argumentParser.add_argument('--ff', '--failed-first', { action: 'store_true', dest: 'failedfirst' });
        argumentParser.add_argument('--nf', '--new-first', { action: 'store_true', dest: 'newfirst' });
        argumentParser.add_argument('--cache-show', { action: 'store_true', dest: 'cacheshow' });
        argumentParser.add_argument('--lfnf', '--last-failed-no-failures', { action: 'store', dest: 'last_failed_no_failures', choices: ['all', 'none'], default: 'all' });
        argumentParser.add_argument('--pdb', { dest: 'usepdb', action: 'store_true' });
        argumentParser.add_argument('--pdbcls', { dest: 'usepdb_cls' });
        argumentParser.add_argument('--junitxml', '--junit-xml', { action: 'store', dest: 'xmlpath' });
        argumentParser.add_argument('--junitprefix', '--junit-prefix', { action: 'store' });
        return argumentParser;
    }
    createTemporaryFile() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                tmp.file((error, file, _, cleanupCallback) => {
                    if (error) {
                        reject(new Error(`Can not create temporary file ${file}: ${error}`));
                    }
                    resolve({ file, cleanupCallback });
                });
            });
        });
    }
}
exports.PytestTestRunner = PytestTestRunner;
//# sourceMappingURL=pytestTestRunner.js.map