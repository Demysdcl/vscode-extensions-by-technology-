"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const BootApp_1 = require("./BootApp");
const jvm_launch_utils_1 = require("@pivotal-tools/jvm-launch-utils");
const path = require("path");
const stream_util_1 = require("./stream-util");
const getPort = require("get-port");
class Controller {
    constructor(manager, context) {
        this._outputChannels = new Map();
        this._manager = manager;
        this._context = context;
    }
    getAppList() {
        return this._manager.getAppList();
    }
    startBootApps(debug) {
        return __awaiter(this, void 0, void 0, function* () {
            const appList = this.getAppList();
            if (appList.length === 1 && appList[0].state !== BootApp_1.AppState.RUNNING) {
                this.startBootApp(appList[0], debug);
            }
            else {
                const appsToStart = yield vscode.window.showQuickPick(appList.filter(app => app.state !== BootApp_1.AppState.RUNNING).map(app => ({ label: app.name, path: app.path })), /** items */ { canPickMany: true, placeHolder: `Select apps to ${debug ? "debug" : "start"}.` } /** options */);
                if (appsToStart !== undefined) {
                    const appPaths = appsToStart.map(elem => elem.path);
                    yield Promise.all(appList.filter(app => appPaths.indexOf(app.path) > -1).map(app => this.startBootApp(app, debug)));
                }
            }
        });
    }
    startBootApp(app, debug) {
        return __awaiter(this, void 0, void 0, function* () {
            const mainClasData = yield vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: `Resolving main classes for ${app.name}...` }, () => { return this._getMainClass(app); });
            if (mainClasData === null) {
                vscode.window.showWarningMessage("No main class is found.");
                return;
            }
            if (mainClasData === undefined) {
                return;
            }
            let targetConfig = this._getLaunchConfig(mainClasData);
            if (!targetConfig) {
                targetConfig = yield this._createNewLaunchConfig(mainClasData);
            }
            app.activeSessionName = targetConfig.name;
            let jmxport = yield getPort();
            app.jmxPort = jmxport;
            let vmArgs = [
                '-Dcom.sun.management.jmxremote',
                `-Dcom.sun.management.jmxremote.port=${jmxport}`,
                '-Dcom.sun.management.jmxremote.authenticate=false',
                '-Dcom.sun.management.jmxremote.ssl=false',
                '-Djava.rmi.server.hostname=localhost',
                '-Dspring.application.admin.enabled=true',
                '-Dspring.jmx.enabled=true'
            ];
            if (targetConfig.vmArgs) {
                var mergeArgs;
                // TODO: smarter merge? What if user is trying to enable jmx themselves on a specific port they choose, for example?
                if (typeof targetConfig.vmArgs === 'string') {
                    mergeArgs = targetConfig.vmArgs.split(/\s+/);
                }
                else { // array case
                    mergeArgs = targetConfig.vmArgs;
                }
                vmArgs.splice(vmArgs.length, 0, ...mergeArgs);
            }
            const cwdUri = vscode.Uri.parse(app.path);
            yield vscode.debug.startDebugging(vscode.workspace.getWorkspaceFolder(cwdUri), Object.assign({}, targetConfig, {
                noDebug: !debug,
                cwd: cwdUri.fsPath,
                vmArgs
            }));
        });
    }
    onDidStartBootApp(session) {
        const app = this._manager.getAppList().find((elem) => elem.activeSessionName === session.name);
        if (app) {
            this._manager.bindDebugSession(app, session);
            this._setState(app, BootApp_1.AppState.RUNNING);
        }
    }
    stopBootApp(app, restart) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: How to send a shutdown signal to the app instead of killing the process directly?
            const session = this._manager.getSessionByApp(app);
            if (session) {
                yield session.customRequest("disconnect", { restart: !!restart });
            }
            else {
                // What if session not found? Force to set STATE_INACTIVE?
            }
        });
    }
    onDidStopBootApp(session) {
        const app = this._manager.getAppBySession(session);
        if (app) {
            this._setState(app, BootApp_1.AppState.INACTIVE);
        }
    }
    openBootApp(app) {
        return __awaiter(this, void 0, void 0, function* () {
            let jvm = yield jvm_launch_utils_1.findJvm();
            if (!jvm) {
                throw new Error("Couldn't find a JVM to run Java code");
            }
            let jmxport = app.jmxPort;
            if (jmxport) {
                let jmxurl = `service:jmx:rmi:///jndi/rmi://localhost:${jmxport}/jmxrmi`;
                if (jvm) {
                    let javaProcess = jvm.jarLaunch(path.resolve(this._context.extensionPath, "lib", "java-extension.jar"), [
                        "-Djmxurl=" + jmxurl
                    ]);
                    let port = parseInt(yield stream_util_1.readAll(javaProcess.stdout));
                    if (port > 0) {
                        vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(`http://localhost:${port}/`));
                    }
                    else {
                        let err = yield stream_util_1.readAll(javaProcess.stderr);
                        console.log(err);
                        vscode.window.showErrorMessage("Couldn't determine port app is running on");
                    }
                }
            }
        });
    }
    _setState(app, state) {
        const output = this._getOutput(app);
        app.state = state;
        output.appendLine(`${app.name} is ${state} now.`);
        this._manager.fireDidChangeApps();
    }
    _getChannelName(app) {
        return `BootApp_${app.name}`;
    }
    _getOutput(app) {
        const channelName = this._getChannelName(app);
        let output = this._outputChannels.get(channelName);
        if (!output) {
            output = vscode.window.createOutputChannel(channelName);
            this._outputChannels.set(channelName, output);
        }
        return output;
    }
    _getMainClass(app) {
        return __awaiter(this, void 0, void 0, function* () {
            // Note: Command `vscode.java.resolveMainClass` is implemented in extension `vscode.java.resolveMainClass`
            const mainClassList = yield vscode.commands.executeCommand('java.execute.workspaceCommand', 'vscode.java.resolveMainClass', app.path);
            if (mainClassList && mainClassList instanceof Array && mainClassList.length > 0) {
                return mainClassList.length === 1 ? mainClassList[0] :
                    yield vscode.window.showQuickPick(mainClassList.map(x => Object.assign({ label: x.mainClass }, x)), { placeHolder: `Specify the main class for ${app.name}` });
            }
            return Promise.resolve(null);
        });
    }
    _getLaunchConfig(mainClasData) {
        const launchConfigurations = vscode.workspace.getConfiguration("launch", vscode.Uri.file(mainClasData.filePath));
        const rawConfigs = launchConfigurations.configurations;
        return rawConfigs.find(conf => conf.type === "java" && conf.request === "launch" && conf.mainClass === mainClasData.mainClass && conf.projectName === mainClasData.projectName);
    }
    _constructLaunchConfigName(mainClass, projectName) {
        const prefix = "Spring Boot-";
        let name = prefix + mainClass.substr(mainClass.lastIndexOf(".") + 1);
        if (projectName !== undefined) {
            name += `<${projectName}>`;
        }
        return name;
    }
    _createNewLaunchConfig(mainClasData) {
        return __awaiter(this, void 0, void 0, function* () {
            const newConfig = {
                type: "java",
                name: this._constructLaunchConfigName(mainClasData.mainClass, mainClasData.projectName),
                request: "launch",
                cwd: "${workspaceFolder}",
                console: "internalConsole",
                mainClass: mainClasData.mainClass,
                projectName: mainClasData.projectName,
                args: "",
            };
            const launchConfigurations = vscode.workspace.getConfiguration("launch", vscode.Uri.file(mainClasData.filePath));
            const configs = launchConfigurations.configurations;
            configs.push(newConfig);
            yield launchConfigurations.update("configurations", configs, vscode.ConfigurationTarget.WorkspaceFolder);
            return newConfig;
        });
    }
}
exports.Controller = Controller;
//# sourceMappingURL=Controller.js.map