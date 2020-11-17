"use strict";
/*! Copyright (c) Microsoft Corporation. All rights reserved. */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonSupport = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vscode = __importStar(require("vscode"));
const genericErrorMessage = "Cannot start IntelliCode support for Python. See output window for more details.";
const defaultAnalyzerName = "intellisense-members";
const lstmAnalyzerName = "intellisense-members-lstm";
const scopesToTry = [
    vscode.ConfigurationTarget.Global,
    vscode.ConfigurationTarget.Workspace,
    vscode.ConfigurationTarget.WorkspaceFolder,
];
const notificationMessage = "IntelliCode Python support requires you to use the Microsoft Python Language Server (preview).";
const actionLabel = "Enable it and Reload Window";
const lsTypeSettingName = "languageServer";
const MPLS = "Microsoft";
const Pylance = "Pylance";
const Node = "Node";
class PythonSupport {
    constructor() {
        this.logger = () => { };
    }
    getRequestedConfig() {
        const pythonExtension = vscode.extensions.getExtension("ms-python.python");
        if (!pythonExtension) {
            return [];
        }
        const json = pythonExtension.packageJSON;
        const jediEnabledExists = json.contributes.configuration.properties["python.jediEnabled"] !== undefined;
        if (!json.languageServerVersion) {
            return [];
        }
        if (jediEnabledExists) {
            return [
                {
                    scopeName: "python",
                    settingName: "jediEnabled",
                    desiredValue: false,
                    required: true,
                    scopesToTry,
                    reloadWindowAfterApplying: true,
                    notificationMessage,
                    actionLabel,
                },
            ];
        }
        const config = vscode.workspace.getConfiguration("python");
        const lsType = config ? config.get(lsTypeSettingName) : undefined;
        if (lsType !== Pylance && lsType !== Node) {
            return [
                {
                    scopeName: "python",
                    settingName: lsTypeSettingName,
                    desiredValue: MPLS,
                    required: true,
                    scopesToTry,
                    reloadWindowAfterApplying: true,
                    notificationMessage,
                    actionLabel,
                },
            ];
        }
        return [];
    }
    activate(api, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger = logger;
            const pythonExtension = vscode.extensions.getExtension("ms-python.python");
            if (!pythonExtension) {
                const err = "Microsoft Python extension is not installed.";
                this.logger(err);
                return Promise.reject(err);
            }
            const config = vscode.workspace.getConfiguration("python");
            if (!config) {
                this.logger("Unable to find Python configuration section.");
                return;
            }
            const ls = config.get(lsTypeSettingName);
            if (!ls || ls === "None") {
                this.logger(`Language server is set to ${ls || "undefined"}, IntelliCode is unable to continue.`);
                return;
            }
            this.logger(`Language server is set to ${ls}.`);
            if (ls === MPLS) {
                return this.handlePythonExtensionV1(api, pythonExtension);
            }
            if (ls === Pylance || ls === Node) {
                return this.handlePythonExtensionV2(api, pythonExtension);
            }
        });
    }
    handlePythonExtensionV1(api, pythonExtension) {
        return __awaiter(this, void 0, void 0, function* () {
            const useDeepLearning = api.isFeatureEnabled("python.deepLearning");
            const analyzerName = useDeepLearning ? lstmAnalyzerName : defaultAnalyzerName;
            const intelliCodeAssemblyName = useDeepLearning ? "IntelliCodeForPythonLstm.dll" : "IntellicodeForPython2.dll";
            const assembly = path_1.default.join(__dirname, intelliCodeAssemblyName);
            try {
                fs_1.default.accessSync(assembly, fs_1.default.constants.F_OK);
            }
            catch (err) {
                this.logger(`Python Language Server extension assembly doesn't exist in ${assembly}. Please reinstall IntelliCode.`);
                return Promise.reject(err);
            }
            let model = yield this.acquireModel(api, analyzerName);
            if (!model && analyzerName === lstmAnalyzerName) {
                this.logger("No deep learning model available for Python, fall back to the default model.");
                model = yield this.acquireModel(api, defaultAnalyzerName);
            }
            if (!model) {
                this.logger("No model available for Python, cannot continue.");
                return;
            }
            yield this.activatePythonExtension(pythonExtension);
            const typeName = "Microsoft.PythonTools.Analysis.Pythia.LanguageServerExtensionProvider";
            const command = vscode.commands.executeCommand("python._loadLanguageServerExtension", {
                assembly,
                typeName,
                properties: {
                    modelPath: model.modelPath,
                },
            });
            if (!command) {
                this.logger("Couldn't find language server extension command. Is the installed version of Python 2018.7.0 or later?");
                return Promise.reject(new Error(genericErrorMessage));
            }
        });
    }
    handlePythonExtensionV2(api, pythonExtension) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger("Acquiring model");
            const model = yield this.acquireModel(api, lstmAnalyzerName);
            if (!model) {
                this.logger("No model available for Python, cannot continue.");
                return;
            }
            this.logger("Activating Python extension");
            yield this.activatePythonExtension(pythonExtension);
            try {
                yield vscode.commands.executeCommand("python.intellicode.loadLanguageServerExtension", {
                    modelPath: model.modelPath,
                });
            }
            catch (e) {
                const message = `Language server extension command failed. Exception: ${e.stack}`;
                this.logger(message);
                return Promise.reject(new Error(message));
            }
        });
    }
    activatePythonExtension(pythonExtension) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pythonExtension.isActive) {
                yield pythonExtension.activate();
            }
            yield pythonExtension.exports.ready;
        });
    }
    acquireModel(api, analyzerName) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = api.ModelAcquisitionService.getModelProvider("python", analyzerName).getModelAsync();
            if (model) {
                const modelJson = JSON.stringify(model);
                this.logger(`vs-intellicode-python was passed a model: ${modelJson}.`);
            }
            return model;
        });
    }
}
exports.PythonSupport = PythonSupport;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnNjb2RlLWludGVsbGljb2RlLXB5dGhvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy92c2NvZGUtaW50ZWxsaWNvZGUtcHl0aG9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxnRUFBZ0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFHaEUsNENBQW9CO0FBQ3BCLGdEQUF3QjtBQUN4QiwrQ0FBaUM7QUFFakMsTUFBTSxtQkFBbUIsR0FBVyxrRkFBa0YsQ0FBQztBQUN2SCxNQUFNLG1CQUFtQixHQUFHLHNCQUFzQixDQUFDO0FBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsMkJBQTJCLENBQUM7QUFDckQsTUFBTSxXQUFXLEdBQUc7SUFDaEIsTUFBTSxDQUFDLG1CQUFtQixDQUFDLE1BQU07SUFDakMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVM7SUFDcEMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLGVBQWU7Q0FDN0MsQ0FBQztBQUNGLE1BQU0sbUJBQW1CLEdBQ3JCLGdHQUFnRyxDQUFDO0FBQ3JHLE1BQU0sV0FBVyxHQUFHLDZCQUE2QixDQUFDO0FBRWxELE1BQU0saUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7QUFFM0MsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDO0FBRXpCLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUUxQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUM7QUFFcEIsTUFBYSxhQUFhO0lBQTFCO1FBQ1ksV0FBTSxHQUEwQixHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7SUEwTHJELENBQUM7SUFyTEcsa0JBQWtCO1FBUWQsTUFBTSxlQUFlLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUMzRSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ2xCLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxNQUFNLElBQUksR0FBRyxlQUFlLENBQUMsV0FBVyxD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