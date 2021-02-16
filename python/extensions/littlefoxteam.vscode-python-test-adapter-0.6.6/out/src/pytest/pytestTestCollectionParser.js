"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTestSuites = void 0;
const tslib_1 = require("tslib");
const os = tslib_1.__importStar(require("os"));
const path = tslib_1.__importStar(require("path"));
const collections_1 = require("../utilities/collections");
const DISCOVERED_TESTS_START_MARK = '==DISCOVERED TESTS BEGIN==';
const DISCOVERED_TESTS_END_MARK = '==DISCOVERED TESTS END==';
function parseTestSuites(content, cwd) {
    const from = content.indexOf(DISCOVERED_TESTS_START_MARK);
    const to = content.indexOf(DISCOVERED_TESTS_END_MARK);
    if (from < 0 || to < 0) {
        throw new Error(`Invalid test discovery output!${os.EOL}${content}`);
    }
    const discoveredTestsJson = content.substring(from + DISCOVERED_TESTS_START_MARK.length, to);
    const discoveryResult = JSON.parse(discoveredTestsJson);
    const allTests = (discoveryResult.tests || [])
        .map(line => (Object.assign(Object.assign({}, line), { id: line.id.replace(/::\(\)/g, '') })))
        .filter(line => line.id)
        .map(line => splitModule(line, cwd))
        .filter(line => line)
        .map(line => line);
    const suites = Array.from(collections_1.groupBy(allTests, t => t.modulePath).entries())
        .map(([modulePath, tests]) => ({
        type: 'suite',
        id: modulePath,
        label: path.basename(modulePath),
        file: modulePath,
        tooltip: modulePath,
        children: toTestSuites(tests.map(t => ({
            idHead: t.modulePath,
            idTail: t.testPath,
            line: t.line,
            path: modulePath,
        }))),
    }));
    const aggregatedErrors = Array.from(collections_1.groupBy((discoveryResult.errors || []), e => e.file).entries())
        .map(([file, messages]) => ({
        file: path.resolve(cwd, file),
        message: messages.map(e => e.message).join(os.EOL),
    }));
    const discoveryErrorSuites = aggregatedErrors.map(({ file, message }) => ({
        type: 'test',
        id: file,
        file,
        label: `Error in ${path.basename(file)}`,
        errored: true,
        message,
    }));
    return suites.concat(discoveryErrorSuites);
}
exports.parseTestSuites = parseTestSuites;
function toTestSuites(tests) {
    if (collections_1.empty(tests)) {
        return [];
    }
    const testsAndSuites = collections_1.groupBy(tests, t => t.idTail.includes('::'));
    const firstLevelTests = toFirstLevelTests(testsAndSuites.get(false));
    const suites = toSuites(testsAndSuites.get(true));
    return firstLevelTests.concat(suites);
}
function toSuites(suites) {
    if (!suites) {
        return [];
    }
    return Array.from(collections_1.groupBy(suites.map(test => splitTest(test)), group => group.idHead).entries())
        .map(([suite, suiteTests]) => ({
        type: 'suite',
        id: suite,
        label: suiteTests[0].name,
        file: suiteTests[0].path,
        children: toTestSuites(suiteTests),
        tooltip: suite,
    }));
}
function toFirstLevelTests(tests) {
    if (!tests) {
        return [];
    }
    const testsByParameterized = collections_1.groupBy(tests, t => t.idTail.includes('['));
    const basicTests = (testsByParameterized.get(false) || []).map(toTest);
    const parameterizedTestsBySuite = collections_1.groupBy(testsByParameterized.get(true) || [], t => t.idTail.substring(0, t.idTail.indexOf('[')));
    const parameterizedSuites = Array.from(parameterizedTestsBySuite.entries())
        .map(([baseName, parameterizedTests]) => ({
        type: 'suite',
        id: `${parameterizedTests[0].idHead}::${baseName}`,
        label: baseName,
        file: parameterizedTests[0].path,
        children: parameterizedTests.map(toTest),
    }));
    return basicTests.concat(parameterizedSuites);
}
function toTest(test) {
    const testId = `${test.idHead}::${test.idTail}`;
    return {
        id: testId,
        label: test.idTail,
        type: 'test',
        file: test.path,
        line: test.line,
        tooltip: testId,
    };
}
function splitTest(test) {
    const separatorIndex = test.idTail.indexOf('::');
    return {
        idHead: `${test.idHead}::${test.idTail.substring(0, separatorIndex)}`,
        idTail: test.idTail.substring(separatorIndex + 2),
        name: test.idTail.substring(0, separatorIndex),
        path: test.path,
        line: test.line,
    };
}
function splitModule(test, cwd) {
    const separatorIndex = test.id.indexOf('::');
    if (separatorIndex < 0) {
        return null;
    }
    return {
        modulePath: path.resolve(cwd, test.id.substring(0, separatorIndex)),
        testPath: test.id.substring(separatorIndex + 2),
        line: test.line,
    };
}
//# sourceMappingURL=pytestTestCollectionParser.js.map