"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnittestTestRunner = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const environmentVariablesLoader_1 = require("../environmentVariablesLoader");
const pythonRunner_1 = require("../pythonRunner");
const collections_1 = require("../utilities/collections");
const tests_1 = require("../utilities/tests");
const unittestScripts_1 = require("./unittestScripts");
const unittestSuitParser_1 = require("./unittestSuitParser");
class UnittestTestRunner {
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
            const additionalEnvironment = yield environmentVariablesLoader_1.EnvironmentVariablesLoader.load(config.envFile(), process.env, this.logger);
            const unittestArguments = config.getUnittestConfiguration().unittestArguments;
            const testId = this.normalizeDebugTestId(unittestArguments.startDirectory, config.getCwd(), test);
            this.logger.log('info', `Debugging test "${testId}" using python path "${config.pythonPath()}" in ${config.getCwd()}`);
            return {
                module: 'unittest',
                cwd: config.getCwd(),
                args: [testId],
                env: additionalEnvironment,
            };
        });
    }
    load(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!config.getUnittestConfiguration().isUnittestEnabled) {
                this.logger.log('info', 'Unittest test discovery is disabled');
                return undefined;
            }
            const additionalEnvironment = yield environmentVariablesLoader_1.EnvironmentVariablesLoader.load(config.envFile(), process.env, this.logger);
            const unittestArguments = config.getUnittestConfiguration().unittestArguments;
            this.logger.log('info', `Discovering tests using python path "${config.pythonPath()}" in ${config.getCwd()} ` +
                `with pattern ${unittestArguments.pattern} and start directory ${unittestArguments.startDirectory}`);
            const result = yield pythonRunner_1.runScript({
                pythonPath: config.pythonPath(),
                script: unittestScripts_1.UNITTEST_TEST_RUNNER_SCRIPT,
                args: ['discover', unittestArguments.startDirectory, unittestArguments.pattern],
                cwd: config.getCwd(),
                environment: additionalEnvironment,
            }).complete();
            const tests = unittestSuitParser_1.parseTestSuites(result.output, path.resolve(config.getCwd(), unittestArguments.startDirectory));
            if (collections_1.empty(tests)) {
                this.logger.log('warn', 'No tests discovered');
                return undefined;
            }
            tests_1.setDescriptionForEqualLabels(tests, '.');
            return {
                type: 'suite',
                id: this.adapterId,
                label: 'Unittest tests',
                children: tests,
            };
        });
    }
    run(config, test) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!config.getUnittestConfiguration().isUnittestEnabled) {
                this.logger.log('info', 'Unittest test execution is disabled');
                return [];
            }
            const unittestArguments = config.getUnittestConfiguration().unittestArguments;
            this.logger.log('info', `Running tests using python path "${config.pythonPath()}" in ${config.getCwd()} ` +
                `with pattern ${unittestArguments.pattern} and start directory ${unittestArguments.startDirectory}`);
            const additionalEnvironment = yield environmentVariablesLoader_1.EnvironmentVariablesLoader.load(config.envFile(), process.env, this.logger);
            const testExecution = pythonRunner_1.runScript({
                pythonPath: config.pythonPath(),
                script: unittestScripts_1.UNITTEST_TEST_RUNNER_SCRIPT,
                cwd: config.getCwd(),
                args: test !== this.adapterId ?
                    ['run', unittestArguments.startDirectory, unittestArguments.pattern, test] :
                    ['run', unittestArguments.startDirectory, unittestArguments.pattern],
                environment: additionalEnvironment,
            });
            this.testExecutions.set(test, testExecution);
            const result = yield testExecution.complete();
            this.testExecutions.delete(test);
            return unittestSuitParser_1.parseTestStates(result.output);
        });
    }
    normalizeDebugTestId(startDirectory, cwd, relativeTestId) {
        const relativeStartDirectory = path.isAbsolute(startDirectory) ?
            path.relative(cwd, startDirectory) :
            startDirectory;
        if (relativeStartDirectory === '.') {
            return relativeTestId;
        }
        const testPath = relativeStartDirectory.split(path.sep).join('.').replace(/\.+/, '.');
        if (testPath.endsWith('.')) {
            return testPath + relativeTestId;
        }
        else if (!testPath) {
            return relativeTestId;
        }
        else {
            return testPath + '.' + relativeTestId;
        }
    }
}
exports.UnittestTestRunner = UnittestTestRunner;
//# sourceMappingURL=unittestTestRunner.js.map