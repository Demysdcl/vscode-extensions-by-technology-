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
exports.executeCommand = exports.deactivate = exports.activate = void 0;
const extensionApi_1 = require("./extensionApi");
const rsp_client_1 = require("rsp-client");
const rspProviderAPI_1 = require("./api/implementation/rspProviderAPI");
const serverEditorAdapter_1 = require("./serverEditorAdapter");
const serverExplorer_1 = require("./serverExplorer");
const vscode = require("vscode");
let serversExplorer;
let commandHandler;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        serversExplorer = serverExplorer_1.ServerExplorer.getInstance();
        commandHandler = new extensionApi_1.CommandHandler(serversExplorer);
        registerCommands(commandHandler, context);
        return rspProviderAPI_1.getAPI();
    });
}
exports.activate = activate;
function registerCommands(commandHandler, context) {
    const errorMessage = 'Unable to %ACTION% the server: ';
    const newLocal = [
        vscode.commands.registerCommand('server.startRSP', context => executeCommand(commandHandler.startRSP, commandHandler, context, errorMessage.replace('%ACTION%', 'start'))),
        vscode.commands.registerCommand('server.stopRSP', context => executeCommand(commandHandler.stopRSP, commandHandler, false, context, errorMessage.replace('%ACTION%', 'stop'))),
        vscode.commands.registerCommand('server.terminateRSP', context => executeCommand(commandHandler.stopRSP, commandHandler, true, context, errorMessage.replace('%ACTION%', 'start'))),
        vscode.commands.registerCommand('server.start', context => executeCommand(commandHandler.startServer, commandHandler, 'run', context, errorMessage.replace('%ACTION%', 'start'))),
        vscode.commands.registerCommand('server.restart', context => executeCommand(commandHandler.restartServer, commandHandler, 'run', context, errorMessage.replace('%ACTION%', 'restart in run mode'))),
        vscode.commands.registerCommand('server.debug', context => executeCommand(commandHandler.debugServer, commandHandler, context, errorMessage.replace('%ACTION%', 'debug'))),
        vscode.commands.registerCommand('server.restartDebug', context => executeCommand(commandHandler.restartServer, commandHandler, 'debug', context, errorMessage.replace('%ACTION%', 'restart in debug mode'))),
        vscode.commands.registerCommand('server.stop', context => executeCommand(commandHandler.stopServer, commandHandler, false, context, errorMessage.replace('%ACTION%', 'stop'))),
        vscode.commands.registerCommand('server.terminate', context => executeCommand(commandHandler.stopServer, commandHandler, true, context, errorMessage.replace('%ACTION%', 'terminate'))),
        vscode.commands.registerCommand('server.remove', context => executeCommand(commandHandler.removeServer, commandHandler, context, errorMessage.replace('%ACTION%', 'remove'))),
        vscode.commands.registerCommand('server.output', context => executeCommand(commandHandler.showServerOutput, commandHandler, context, 'Unable to show server output channel')),
        vscode.commands.registerCommand('server.addDeployment', context => executeCommand(commandHandler.addDeployment, commandHandler, context, errorMessage.replace('%ACTION%', 'add deployment to'))),
        vscode.commands.registerCommand('server.removeDeployment', context => executeCommand(commandHandler.removeDeployment, commandHandler, context, errorMessage.replace('%ACTION%', 'remove deployment to'))),
        vscode.commands.registerCommand('server.publishFull', context => executeCommand(commandHandler.publishServer, commandHandler, rsp_client_1.ServerState.PUBLISH_FULL, context, errorMessage.replace('%ACTION%', 'publish (Full) to'))),
        vscode.commands.registerCommand('server.publishIncremental', context => executeCommand(commandHandler.publishServer, commandHandler, rsp_client_1.ServerState.PUBLISH_INCREMENTAL, context, errorMessage.replace('%ACTION%', 'publish (Incremental) to'))),
        vscode.commands.registerCommand('server.createServer', context => executeCommand(commandHandler.createServer, commandHandler, context, errorMessage.replace('%ACTION%', 'create'))),
        vscode.commands.registerCommand('server.addLocation', context => executeCommand(commandHandler.addLocation, commandHandler, context, 'Unable to detect any server: ')),
        vscode.commands.registerCommand('server.downloadRuntime', context => executeCommand(commandHandler.downloadRuntime, commandHandler, context, 'Unable to detect any runtime: ')),
        vscode.commands.registerCommand('server.actions', context => executeCommand(commandHandler.serverActions, commandHandler, context, 'Unable to execute action')),
        vscode.commands.registerCommand('server.editServer', context => executeCommand(commandHandler.editServer, commandHandler, context, 'Unable to edit server properties')),
        vscode.commands.registerCommand('server.application.run', context => executeCommand(commandHandler.runOnServer, commandHandler, context, 'run', 'Unable to deploy and run application')),
        vscode.commands.registerCommand('server.application.debug', context => executeCommand(commandHandler.runOnServer, commandHandler, context, 'debug', 'Unable to deploy and debug application')),
        vscode.commands.registerCommand('server.saveSelectedNode', context => executeCommand(commandHandler.saveSelectedNode, commandHandler, context)),
        vscode.workspace.onDidSaveTextDocument(onDidSaveTextDocument),
        vscode.workspace.onDidCloseTextDocument(onDidCloseTextDocument)
    ];
    const subscriptions = newLocal;
    subscriptions.forEach(element => {
        context.subscriptions.push(element);
    }, this);
}
function deactivate() {
    for (const rspProvider of serversExplorer.RSPServersStatus.values()) {
        if (rspProvider.client) {
            rspProvider.client.shutdownServer();
        }
    }
}
exports.deactivate = deactivate;
/*
function stopServer(client: RSPClient, val: ServerStateNode) {
    const oneStat: ServerStateNode = val;
    const stateNum = oneStat.state;
    if (stateNum !== ServerState.UNKNOWN
      && stateNum !== ServerState.STOPPED
      && stateNum !== ServerState.STOPPING) {
        client.getOutgoingHandler().stopServerAsync({ id: oneStat.server.id, force: true });
    }
    }
*/
function onDidSaveTextDocument(doc) {
    serverEditorAdapter_1.ServerEditorAdapter.getInstance(serversExplorer).onDidSaveTextDocument(doc).catch(err => {
        vscode.window.showErrorMessage(err);
    });
}
function onDidCloseTextDocument(doc) {
    serverEditorAdapter_1.ServerEditorAdapter.getInstance(serversExplorer).onDidCloseTextDocument(doc);
}
function executeCommand(command, thisArg, ...params) {
    const commandErrorLabel = typeof params[params.length - 1] === 'string' ? params[params.length - 1] : '';
    return command.call(thisArg, ...params).catch((err) => {
        const error = typeof err === 'string' ? new Error(err) : err;
        const msg = error.hasOwnProperty('message') ? error.message : '';
        if (commandErrorLabel === '' && msg === '') {
            return;
        }
        vscode.window.showErrorMessage(`${commandErrorLabel} Extension backend error - ${msg.toLowerCase()}`);
    });
}
exports.executeCommand = executeCommand;
//# sourceMappingURL=extension.js.map