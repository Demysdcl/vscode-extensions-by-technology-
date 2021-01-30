"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreviewService = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));
const rcp_1 = require("./rcp");
const kill = require('tree-kill');
const isActiveContext = 'flutter_preview.isActive';
var rcpService;
class PreviewService {
    constructor(workspaceUri) {
        this.disposables = [];
        this.isActive = false;
        this.workspaceUri = workspaceUri;
    }
    start() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            if (this.isActive && ((_a = vscode.debug.activeDebugSession) === null || _a === void 0 ? void 0 : _a.name) === 'Flutter Preview') {
                vscode.window.showInformationMessage('Flutter preview is already running');
                return;
            }
            this.isActive = true;
            vscode.commands.executeCommand("setContext", isActiveContext, true);
            yield this.launchDartPreviewProccess();
            let disp = vscode.workspace.onDidSaveTextDocument((e) => { self.onDidSaveTextEditor(e); });
            let disp2 = vscode.window.onDidChangeActiveTextEditor((e) => {
                self.onDidUpdateActiveTextEditor();
            });
            this.disposables.push(disp, disp2);
            this.onDidUpdateActiveTextEditor();
        });
    }
    launchDartPreviewProccess() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            console.log('Set up dart process');
            try {
                this.childProcess = cp.spawn('flutter', [
                    'pub',
                    'run',
                    'preview:preview'
                ], { cwd: this.workspaceUri.fsPath, shell: true });
                rcpService = new rcp_1.RcpService(this.childProcess.stdout, this.childProcess.stdin);
                var sr = this.rcpService;
                var ch = this.childProcess;
                rcpService.onNotification((data) => {
                    if (data['method'] === 'preview.restart') {
                        vscode.commands.executeCommand('flutter.hotRestart');
                    }
                    else if (data['method'] === 'preview.launch') {
                        let port = data['params']['port'];
                        self.launchDebugSession(port);
                    }
                });
                console.log('Finish Set up dart process');
                (_a = this.childProcess) === null || _a === void 0 ? void 0 : _a.on('error', (err) => {
                    this.cancel();
                    console.log('Error dart process: ', err.toString());
                });
                (_c = (_b = this.childProcess) === null || _b === void 0 ? void 0 : _b.stderr) === null || _c === void 0 ? void 0 : _c.on('data', function (data) {
                    console.log('err data: ' + data);
                });
            }
            catch (e) {
                console.log(e);
            }
        });
    }
    launchDebugSession(port) {
        return __awaiter(this, void 0, void 0, function* () {
            const launchConfiguration = {
                type: "dart",
                name: "Flutter Preview",
                request: "launch",
                // deviceId: "macOS",
                cwd: "",
                internalConsoleOptions: "neverOpen",
                args: [
                    "--target=lib/main.preview.dart",
                    "--dart-define=flutter.preview=true",
                    `--dart-define=preview.port=${port}`
                ],
            };
            const launched = yield vscode.debug.startDebugging(vscode.workspace.workspaceFolders[0], launchConfiguration);
            if (!launched) {
                vscode.window.showInformationMessage('Flutter is not ready');
                this.cancel();
                return;
            }
            let disp = vscode.debug.onDidTerminateDebugSession((e) => this.cancel());
            this.disposables.push(disp);
        });
    }
    cancel() {
        var _a;
        console.log('cancel session');
        this.isActive = false;
        (_a = this.rcpService) === null || _a === void 0 ? void 0 : _a.dispose();
        this.rcpService = undefined;
        if (this.childProcess !== undefined) {
            kill(this.childProcess.pid, 'SIGKILL');
        }
        this.childProcess = undefined;
        this.disposables.forEach((s) => s.dispose());
        vscode.commands.executeCommand("setContext", isActiveContext, false);
    }
    onDidSaveTextEditor(document) {
        if (document.languageId === "dart" && document.uri === this.currentDocument) {
            this.onDidUpdateActiveTextEditor();
        }
    }
    ;
    onDidUpdateActiveTextEditor() {
        var _a;
        const editor = vscode.window.activeTextEditor;
        this.currentDocument = (_a = editor === null || editor === void 0 ? void 0 : editor.document) === null || _a === void 0 ? void 0 : _a.uri;
        let relativePath = vscode.Uri.file(this.currentDocument.fsPath.replace(this.workspaceUri.fsPath, ''));
        const path = relativePath.path.toString().replace('/', '');
        rcpService.request('preview.setActiveFile', { path: path }).then((needsHotReload) => {
            if (needsHotReload) {
                vscode.commands.executeCommand('flutter.hotReload');
            }
        });
    }
    ;
    dispose() {
        this.cancel();
    }
}
exports.PreviewService = PreviewService;
//# sourceMappingURL=preview.js.map