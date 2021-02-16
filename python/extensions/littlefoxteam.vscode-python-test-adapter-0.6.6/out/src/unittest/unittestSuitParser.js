"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTestStates = exports.parseTestSuites = void 0;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const js_base64_1 = require("js-base64");
const os = tslib_1.__importStar(require("os"));
const path = tslib_1.__importStar(require("path"));
const collections_1 = require("../utilities/collections");
const unittestScripts_1 = require("./unittestScripts");
const DISCOVERED_TESTS_START_MARK = '==DISCOVERED TESTS BEGIN==';
const DISCOVERED_TESTS_END_MARK = '==DISCOVERED TESTS END==';
function parseTestSuites(content, cwd) {
    const from = content.indexOf(DISCOVERED_TESTS_START_MARK);
    const to = content.indexOf(DISCOVERED_TESTS_END_MARK);
    const discoveredTestsJson = content.substring(from + DISCOVERED_TESTS_START_MARK.length, to);
    const discoveryResult = JSON.parse(discoveredTestsJson);
    if (!discoveryResult) {
        return [];
    }
    const allTests = (discoveryResult.tests || [])
        .map(line => line.id.trim())
        .filter(id => id)
        .map(id => splitTestId(id))
        .filter(id => id)
        .map(id => id);
    const aggregatedErrors = Array.from(collections_1.groupBy((discoveryResult.errors || []), e => e.class).entries())
        .map(([className, messages]) => ({
        id: splitTestId(className),
        message: messages.map(e => e.message).join(os.EOL),
    }))
        .filter(e => e.id)
        .map(e => ({
        id: e.id,
        file: errorSuiteFilePathBySuiteId(cwd, e.id.testId),
        message: e.message,
    }));
    const discoveryErrorSuites = aggregatedErrors.map(({ id, file, message }) => ({
        type: 'test',
        id: id.testId,
        file,
        label: id.testLabel,
        errored: true,
        message,
    }));
    const suites = Array.from(collections_1.groupBy(allTests, t => t.suiteId).entries())
        .map(([suiteId, tests]) => {
        const suiteFile = filePathBySuiteId(cwd, suiteId);
        return {
            type: 'suite',
            id: suiteId,
            label: suiteId.substring(suiteId.lastIndexOf('.') + 1),
            file: suiteFile,
            tooltip: suiteId,
            children: tests.map(test => ({
                type: 'test',
                id: test.testId,
                label: test.testLabel,
                file: suiteFile,
                tooltip: test.testId,
            })),
        };
    });
    return suites.concat(discoveryErrorSuites);
}
exports.parseTestSuites = parseTestSuites;
function parseTestStates(output) {
    const testEvents = output
        .split(/\r?\n/g)
        .map(line => line.trim())
        .map(line => tryParseTestState(line))
        .filter(line => line)
        .map(line => line);
    return collections_1.distinctBy(testEvents, e => e.test);
}
exports.parseTestStates = parseTestStates;
function tryParseTestState(line) {
    if (!line) {
        return undefined;
    }
    if (!line.startsWith(unittestScripts_1.TEST_RESULT_PREFIX)) {
        return undefined;
    }
    const [, result, testId, base64Message = ''] = line.split(':');
    if (result == null || testId == null) {
        return undefined;
    }
    const state = toState(result.trim());
    if (!state) {
        return undefined;
    }
    return {
        type: 'test',
        test: testId.trim(),
        state,
        message: base64Message ? js_base64_1.Base64.decode(base64Message.trim()) : undefined,
    };
}
function toState(value) {
    switch (value) {
        case 'running':
        case 'passed':
        case 'failed':
        case 'skipped':
            return value;
        default:
            return undefined;
    }
}
function splitTestId(testId) {
    const separatorIndex = testId.lastIndexOf('.');
    if (separatorIndex < 0) {
        return {
            suiteId: testId,
            testId,
            testLabel: testId,
        };
    }
    return {
        suiteId: testId.substring(0, separatorIndex),
        testId,
        testLabel: testId.substring(separatorIndex + 1),
    };
}
function errorSuiteFilePathBySuiteId(cwd, suiteId) {
    const relativePath = suiteId.split('.').join('/');
    const filePathCandidate = path.resolve(cwd, relativePath + '.py');
    if (fs.existsSync(filePathCandidate) && fs.lstatSync(filePathCandidate).isFile()) {
        return filePathCandidate;
    }
    return undefined;
}
function filePathBySuiteId(cwd, suiteId) {
    const separatorIndex = suiteId.lastIndexOf('.');
    if (separatorIndex < 0) {
        return undefined;
    }
    return path.resolve(cwd, suiteId.substring(0, separatorIndex).split('.').join('/') + '.py');
}
//# sourceMappingURL=unittestSuitParser.js.map