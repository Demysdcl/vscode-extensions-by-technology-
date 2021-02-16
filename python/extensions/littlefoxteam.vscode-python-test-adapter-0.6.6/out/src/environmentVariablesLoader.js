"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvironmentVariablesLoader = void 0;
const tslib_1 = require("tslib");
const path = tslib_1.__importStar(require("path"));
const fs_1 = require("./utilities/fs");
const NEWLINE = '\n';
const ENV_FILE_LINE_REGEX = /^\s*([a-zA-Z_]\w*)\s*=\s*(.*?)?\s*$/;
const ESCAPED_NEWLINE_REGEX = /\\n/g;
const VARIABLE_REFERENCE_REGEX = /\${([a-zA-Z_]\w*)}/g;
function isEnclosedIn(s, substring) {
    return s.startsWith(substring) && s.endsWith(substring);
}
class EnvironmentVariablesLoader {
    static load(envFilePath, globalEnvironment, logger) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!envFilePath) {
                logger.log('info', 'Environment variables file is not defined');
                return {};
            }
            const envPath = path.resolve(envFilePath);
            const envFileExists = yield fs_1.isFileExists(envPath);
            if (envFileExists) {
                logger.log('info', `Loading environment variables file ${envPath}`);
                try {
                    const content = yield fs_1.readFile(envPath);
                    return EnvironmentVariablesLoader.parse(content, globalEnvironment);
                }
                catch (_a) {
                    logger.log('warn', `Could not read environment variables file ${envPath}`);
                    return {};
                }
            }
            else {
                logger.log('info', `Environment variables file ${envPath} does not exist`);
                return {};
            }
        });
    }
    static merge(localEnvironment, globalEnvironment) {
        const environmentVariables = {};
        for (const [key, value] of Object.entries(localEnvironment)) {
            environmentVariables[key] = EnvironmentVariablesLoader.resolveEnvironmentVariableValue(value || '', environmentVariables, globalEnvironment);
        }
        return environmentVariables;
    }
    static parse(content, globalEnvironment) {
        const environmentVariables = {};
        content.split(NEWLINE).forEach(line => {
            const parsedKeyValue = EnvironmentVariablesLoader.parseLine(line);
            if (!parsedKeyValue) {
                return;
            }
            const [key, value] = parsedKeyValue;
            environmentVariables[key] = EnvironmentVariablesLoader.resolveEnvironmentVariableValue(value, environmentVariables, globalEnvironment);
        });
        return environmentVariables;
    }
    static parseLine(line) {
        const matchedKeyValue = line.match(ENV_FILE_LINE_REGEX);
        if (matchedKeyValue == null) {
            return undefined;
        }
        const key = matchedKeyValue[1];
        const value = EnvironmentVariablesLoader.normalizeValue(matchedKeyValue[2] || '');
        return [key, value];
    }
    static normalizeValue(value) {
        const isDoubleQuoted = isEnclosedIn(value, '"');
        const isSingleQuoted = isEnclosedIn(value, '\'');
        if (isSingleQuoted || isDoubleQuoted) {
            const valueWithoutQuotes = value.substring(1, value.length - 1);
            return isDoubleQuoted ?
                valueWithoutQuotes.replace(ESCAPED_NEWLINE_REGEX, NEWLINE) :
                valueWithoutQuotes;
        }
        return value.trim();
    }
    static resolveEnvironmentVariableValue(value, localEnvironment, globalEnvironment) {
        const replacement = value.replace(VARIABLE_REFERENCE_REGEX, (match, variableReference) => {
            if (!variableReference) {
                return match;
            }
            return localEnvironment[variableReference] || globalEnvironment[variableReference] || '';
        });
        if (replacement === value) {
            return value;
        }
        return EnvironmentVariablesLoader.resolveEnvironmentVariableValue(replacement.replace(/\\\$/g, '$'), localEnvironment, globalEnvironment);
    }
}
exports.EnvironmentVariablesLoader = EnvironmentVariablesLoader;
//# sourceMappingURL=environmentVariablesLoader.js.map