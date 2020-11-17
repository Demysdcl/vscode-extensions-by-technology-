/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the EPL v2.0 License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cp = require("child_process");
const expandHomeDir = require("expand-home-dir");
const findJavaHome = require("find-java-home");
const path = require("path");
const pathExists = require("path-exists");
const vscode_1 = require("vscode");
const isWindows = process.platform.indexOf('win') === 0;
const JAVAC_FILENAME = 'javac' + (isWindows ? '.exe' : '');
const JAVA_FILENAME = 'java' + (isWindows ? '.exe' : '');
/**
 * Resolves the requirements needed to run the extension.
 * Returns a promise that will resolve to a RequirementsData if
 * all requirements are resolved, it will reject with ErrorData if
 * if any of the requirements fails to resolve.
 */
function resolveRequirements() {
    return __awaiter(this, void 0, void 0, function* () {
        const javaHome = yield checkJavaRuntime();
        const javaVersion = yield checkJavaVersion(javaHome);
        return Promise.resolve({ java_home: javaHome, java_version: javaVersion });
    });
}
exports.resolveRequirements = resolveRequirements;
function checkJavaRuntime() {
    return new Promise((resolve, reject) => {
        let source;
        let javaHome = readJavaConfig();
        if (javaHome) {
            source = 'The java.home variable defined in VS Code settings';
        }
        else {
            javaHome = process.env.JDK_HOME;
            if (javaHome) {
                source = 'The JDK_HOME environment variable';
            }
            else {
                javaHome = process.env.JAVA_HOME;
                source = 'The JAVA_HOME environment variable';
            }
        }
        if (javaHome) {
            javaHome = expandHomeDir(javaHome);
            if (!pathExists.sync(javaHome)) {
                rejectWithDownloadUrl(reject, `${source} points to a missing folder`);
            }
            if (!pathExists.sync(path.resolve(javaHome, 'bin', JAVAC_FILENAME))) {
                rejectWithDownloadUrl(reject, `${source} does not point to a JDK.`);
            }
            return resolve(javaHome);
        }
        // No settings, let's try to detect as last resort.
        findJavaHome((err, home) => {
            if (err) {
                rejectWithDownloadUrl(reject, 'Java runtime could not be located');
            }
            else {
                resolve(home);
            }
        });
    });
}
function readJavaConfig() {
    const config = vscode_1.workspace.getConfiguration();
    return config.get('java.home', '');
}
function checkJavaVersion(javaHome) {
    return new Promise((resolve, reject) => {
        const javaExecutable = path.resolve(javaHome, 'bin', JAVA_FILENAME);
        cp.execFile(javaExecutable, ['-version'], {}, (error, stdout, stderr) => {
            const javaVersion = parseMajorVersion(stderr);
            if (!javaVersion) {
                rejectWithDownloadUrl(reject, `Java 8 or newer is required. No Java was found on your system..
                Please get a recent JDK or configure it for "Servers View" if it already exists`);
            }
            else if (javaVersion < 8) {
                rejectWithDownloadUrl(reject, `Java 8 or newer is required. Java ${javaVersion} was found at ${javaHome}.
                Please get a recent JDK or configure it for "Servers View" if it already exists`);
            }
            else {
                resolve(javaVersion);
            }
        });
    });
}
function parseMajorVersion(content) {
    let regexp = /version "(.*)"/g;
    let match = regexp.exec(content);
    if (!match) {
        return undefined;
    }
    let version = match[1];
    // Ignore '1.' prefix for legacy Java versions
    if (version.startsWith('1.')) {
        version = version.substring(2);
    }
    // look into the interesting bits now
    regexp = /\d+/g;
    match = regexp.exec(version);
    let javaVersion = 0;
    if (match) {
        javaVersion = parseInt(match[0], 10);
    }
    return javaVersion;
}
exports.parseMajorVersion = parseMajorVersion;
const newLocal = 'https://developers.redhat.com/products/openjdk/download/?sc_cid=701f2000000RWTnAAO';
function rejectWithDownloadUrl(reject, message) {
    let jdkUrl = newLocal;
    if (process.platform === 'darwin') {
        jdkUrl = 'http://www.oracle.com/technetwork/java/javase/downloads/index.html';
    }
    reject({
        message: message,
        btns: [
            {
                label: 'Get the Java Development Kit',
                openUrl: vscode_1.Uri.parse(jdkUrl)
            },
            {
                label: 'Configure Java'
            }
        ]
    });
}
//# sourceMappingURL=requirements.js.map