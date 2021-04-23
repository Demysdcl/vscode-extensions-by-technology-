// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
'use strict';
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
const vscode_extension_telemetry_wrapper_1 = require("vscode-extension-telemetry-wrapper");
const LocalAppTree_1 = require("./LocalAppTree");
const BootAppManager_1 = require("./BootAppManager");
const Controller_1 = require("./Controller");
let localAppManager;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_extension_telemetry_wrapper_1.initializeFromJsonFile(context.asAbsolutePath("./package.json"), { firstParty: true });
        yield vscode_extension_telemetry_wrapper_1.instrumentOperation("activation", initializeExtension)(context);
    });
}
exports.activate = activate;
function initializeExtension(_oprationId, context) {
    return __awaiter(this, void 0, void 0, function* () {
        localAppManager = new BootAppManager_1.BootAppManager();
        const localTree = new LocalAppTree_1.LocalAppTreeProvider(localAppManager);
        const controller = new Controller_1.Controller(localAppManager, context);
        context.subscriptions.push(vscode.window.registerTreeDataProvider('spring-boot-dashboard', localTree));
        context.subscriptions.push(instrumentAndRegisterCommand("spring-boot-dashboard.refresh", () => {
            localAppManager.fireDidChangeApps();
        }));
        context.subscriptions.push(instrumentAndRegisterCommand("spring-boot-dashboard.localapp.start", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.startBootApp(app);
        })));
        context.subscriptions.push(instrumentAndRegisterCommand("spring-boot-dashboard.localapp.debug", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.startBootApp(app, true);
        })));
        context.subscriptions.push(instrumentAndRegisterCommand("spring-boot-dashboard.localapp.stop", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.stopBootApp(app);
        })));
        context.subscriptions.push(instrumentAndRegisterCommand("spring-boot-dashboard.localapp.open", (app) => __awaiter(this, void 0, void 0, function* () {
            yield controller.openBootApp(app);
        })));
        context.subscriptions.push(instrumentAndRegisterCommand("spring-boot-dashboard.localapp.start-multiple", () => __awaiter(this, void 0, void 0, function* () {
            yield controller.startBootApps();
        })));
        context.subscriptions.push(instrumentAndRegisterCommand("spring-boot-dashboard.localapp.debug-multiple", () => __awaiter(this, void 0, void 0, function* () {
            yield controller.startBootApps(true);
        })));
        vscode.debug.onDidStartDebugSession((session) => {
            if (session.type === "java") {
                controller.onDidStartBootApp(session);
            }
        });
        vscode.debug.onDidTerminateDebugSession((session) => {
            if (session.type === "java") {
                controller.onDidStopBootApp(session);
            }
        });
    });
}
exports.initializeExtension = initializeExtension;
// this method is called when your extension is deactivated
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_extension_telemetry_wrapper_1.dispose();
    });
}
exports.deactivate = deactivate;
function instrumentAndRegisterCommand(name, cb) {
    const instrumented = vscode_extension_telemetry_wrapper_1.instrumentOperation(name, (_operationId, myargs) => __awaiter(this, void 0, void 0, function* () { return yield cb(myargs); }));
    return vscode.commands.registerCommand(name, instrumented);
}
//# sourceMappingURL=extension.js.map