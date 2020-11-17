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
exports.CommandHandler = void 0;
const client_1 = require("./rsp/client");
const debugInfoProvider_1 = require("./debug/debugInfoProvider");
const javaDebugSession_1 = require("./debug/javaDebugSession");
const rsp_client_1 = require("rsp-client");
const utils_1 = require("./utils/utils");
const vscode = require("vscode");
const workflowResponseStrategyManager_1 = require("./workflow/response/workflowResponseStrategyManager");
let CommandHandler = /** @class */ (() => {
    class CommandHandler {
        constructor(explorer) {
            this.explorer = explorer;
            this.serverPropertiesChannel = new Map();
            this.debugSession = new javaDebugSession_1.JavaDebugSession();
        }
        startRSP(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const filterRSPPredicate = serverR => serverR.state.state === rsp_client_1.ServerState.STOPPED || serverR.state.state === rsp_client_1.ServerState.UNKNOWN;
                    const rsp = yield this.selectRSP('Select RSP provider you want to start', filterRSPPredicate);
                    if (!rsp || !rsp.id)
                        return;
                    context = this.explorer.RSPServersStatus.get(rsp.id).state;
                }
                if (!(context.state === rsp_client_1.ServerState.STOPPED
                    || context.state === rsp_client_1.ServerState.UNKNOWN)) {
                    return Promise.reject(`The RSP server ${context.type.visibilename} is already running.`);
                }
                const rspProvider = yield utils_1.Utils.activateExternalProvider(context.type.id);
                this.setRSPListener(context.type.id, rspProvider);
                const serverInfo = yield rspProvider.startRSP((out) => this.onStdoutData(context.type.id, out), (err) => this.onStderrData(context.type.id, err));
                if (!serverInfo || !serverInfo.port) {
                    return Promise.reject(`Failed to start the ${context.type.visibilename} RSP server`);
                }
                const client = yield client_1.initClient(serverInfo);
                const rspProperties = this.explorer.RSPServersStatus.get(context.type.id);
                rspProperties.client = client;
                rspProperties.state.serverStates = [];
                this.explorer.RSPServersStatus.set(context.type.id, rspProperties);
                yield this.activate(context.type.id, client);
                this.explorer.initRSPNode(context.type.id);
            });
        }
        stopRSP(forced, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    let filterRSPPredicate;
                    if (!forced) {
                        filterRSPPredicate = serverR => serverR.state.state === rsp_client_1.ServerState.STARTED;
                    }
                    else {
                        filterRSPPredicate = serverR => serverR.state.state === rsp_client_1.ServerState.STARTED ||
                            serverR.state.state === rsp_client_1.ServerState.STARTING ||
                            serverR.state.state === rsp_client_1.ServerState.STOPPING;
                    }
                    const rsp = yield this.selectRSP('Select RSP provider you want to start', filterRSPPredicate);
                    if (!rsp || !rsp.id)
                        return null;
                    context = this.explorer.RSPServersStatus.get(rsp.id).state;
                }
                if (context.state === rsp_client_1.ServerState.STARTED
                    || context.state === rsp_client_1.ServerState.STARTING
                    || context.state === rsp_client_1.ServerState.STOPPING) {
                    this.explorer.updateRSPServer(context.type.id, rsp_client_1.ServerState.STOPPING);
                    if (!forced) {
                        const client = this.explorer.getClientByRSP(context.type.id);
                        if (!client) {
                            return Promise.reject(`Failed to contact the RSP server ${context.type.visibilename}.`);
                        }
                        client.shutdownServer();
                    }
                    else {
                        const rspProvider = yield utils_1.Utils.activateExternalProvider(context.type.id);
                        yield rspProvider.stopRSP().catch(err => {
                            // if stopRSP fails, server is still running
                            this.explorer.updateRSPServer(context.type.id, rsp_client_1.ServerState.STARTED);
                            return Promise.reject(`Failed to terminate ${context.type.visibilename} - ${err}`);
                        });
                    }
                    this.explorer.disposeRSPProperties(context.type.id);
                    this.explorer.updateRSPServer(context.type.id, rsp_client_1.ServerState.STOPPED);
                }
                else {
                    return Promise.reject(`The RSP server ${context.type.visibilename} is already stopped.`);
                }
            });
        }
        startServer(mode, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverFilter = server => server.state === rsp_client_1.ServerState.STOPPED || server.state === rsp_client_1.ServerState.UNKNOWN;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to start.', serverFilter);
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                const serverState = this.explorer.getServerStateById(context.rsp, context.server.id).state;
                if (!(serverState === rsp_client_1.ServerState.STOPPED
                    || serverState === rsp_client_1.ServerState.UNKNOWN)) {
                    return Promise.reject('The server is already running.');
                }
                const client = this.explorer.getClientByRSP(context.rsp);
                if (!client) {
                    return Promise.reject('Failed to contact the RSP server.');
                }
                const response = yield client.getOutgoingHandler().startServerAsync({
                    params: {
                        serverType: context.server.type.id,
                        id: context.server.id,
                        attributes: new Map()
                    },
                    mode: mode
                });
                if (!rsp_client_1.StatusSeverity.isOk(response.status)) {
                    return Promise.reject(response.status.message);
                }
                return response;
            });
        }
        stopServer(forced, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverFilter = server => server.state === rsp_client_1.ServerState.STARTED;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to stop.', serverFilter);
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                const serverState = this.explorer.getServerStateById(context.rsp, context.server.id).state;
                if ((!forced && serverState === rsp_client_1.ServerState.STARTED)
                    || (forced && (serverState === rsp_client_1.ServerState.STARTING
                        || serverState === rsp_client_1.ServerState.STOPPING))) {
                    const client = this.explorer.getClientByRSP(context.rsp);
                    if (!client) {
                        return Promise.reject('Failed to contact the RSP server.');
                    }
                    const status = yield client.getOutgoingHandler().stopServerAsync({ id: context.server.id, force: forced });
                    if (this.debugSession.isDebuggerStarted()) {
                        yield this.debugSession.stop();
                    }
                    if (!rsp_client_1.StatusSeverity.isOk(status)) {
                        return Promise.reject(status.message);
                    }
                    return status;
                }
                else {
                    return Promise.reject('The server is already stopped.');
                }
            });
        }
        debugServer(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverFilter = server => server.state === rsp_client_1.ServerState.STOPPED || server.state === rsp_client_1.ServerState.UNKNOWN;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to start.', serverFilter);
                    if (!serverId)
                        return;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                const client = this.explorer.getClientByRSP(context.rsp);
                if (!client) {
                    return Promise.reject('Failed to contact the RSP server.');
                }
                const debugInfo = yield debugInfoProvider_1.DebugInfoProvider.retrieve(context.server, client);
                const extensionIsRequired = yield this.checkExtension(debugInfo);
                if (extensionIsRequired) {
                    return Promise.reject(extensionIsRequired);
                }
                this.startServer('debug', context)
                    .then(serverStarted => {
                    if (!serverStarted
                        || !serverStarted.details) {
                        return Promise.reject(`Failed to start server ${context.server.id}`);
                    }
                    const port = debugInfoProvider_1.DebugInfoProvider.create(serverStarted.details).getPort();
                    this.debugSession.start(context.server, port, client);
                    return Promise.resolve(serverStarted);
                });
            });
        }
        removeServer(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverFilter = server => server.state === rsp_client_1.ServerState.STOPPED || server.state === rsp_client_1.ServerState.UNKNOWN;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to remove', serverFilter);
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                const remove = yield vscode.window.showWarningMessage(`Remove server ${context.server.id}?`, { modal: true }, 'Yes');
                return remove && this.removeStoppedServer(context.rsp, context.server);
            });
        }
        removeStoppedServer(rspId, server) {
            return __awaiter(this, void 0, void 0, function* () {
                const status1 = this.explorer.getServerStateById(rspId, server.id);
                if (status1.state !== rsp_client_1.ServerState.STOPPED) {
                    return Promise.reject(`Stop server ${server.id} before removing it.`);
                }
                const client = this.explorer.getClientByRSP(rspId);
                if (!client) {
                    return Promise.reject('Failed to contact the RSP server.');
                }
                const status = yield client.getOutgoingHandler().deleteServer({ id: server.id, type: server.type });
                if (!rsp_client_1.StatusSeverity.isOk(status)) {
                    return Promise.reject(status.message);
                }
                return status;
            });
        }
        showServerOutput(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to show output channel');
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                this.explorer.showOutput(context);
            });
        }
        restartServer(mode, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverFilter = server => server.state === rsp_client_1.ServerState.STARTED;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to restart', serverFilter);
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                const client = this.explorer.getClientByRSP(context.rsp);
                if (!client) {
                    return Promise.reject('Failed to contact the RSP server.');
                }
                const listener = this.getRestartListener(mode, context, client);
                client.getIncomingHandler().onServerStateChanged(listener);
                return this.stopServer(false, context).catch(err => {
                    // if server fails to stop, remove listener and make error be handled by main catch
                    client.getIncomingHandler().removeOnServerStateChanged(listener);
                    return Promise.reject(err);
                });
            });
        }
        getRestartListener(mode, context, client) {
            const listener = (state) => __awaiter(this, void 0, void 0, function* () {
                try {
                    if (state
                        && state.server
                        && state.server.id === context.server.id
                        && (state.state === rsp_client_1.ServerState.STOPPED ||
                            state.state === rsp_client_1.ServerState.STARTED)) {
                        client.getIncomingHandler().removeOnServerStateChanged(listener);
                        if (state.state === rsp_client_1.ServerState.STOPPED) {
                            switch (mode) {
                                case rsp_client_1.ServerState.RUN_MODE_DEBUG: {
                                    return yield this.debugServer(context);
                                }
                                case rsp_client_1.ServerState.RUN_MODE_RUN: {
                                    return yield this.startServer(rsp_client_1.ServerState.RUN_MODE_RUN, context);
                                }
                                default: {
                                    vscode.window.showErrorMessage(`Could not restart server: unknown mode ${mode}`);
                                }
                            }
                        }
                        else {
                            vscode.window.showErrorMessage('Could not restart server. Server shutdown failed. Server still started');
                        }
                    }
                }
                catch (err) {
                    vscode.window.showErrorMessage(`Failed to restart server. Error- ${err.toLowerCase()}`);
                }
            });
            return listener;
        }
        addDeployment(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to deploy to');
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                if (this.explorer) {
                    return this.explorer.selectAndAddDeployment(context);
                }
                else {
                    return Promise.reject('Runtime Server Protocol (RSP) Server is starting, please try again later.');
                }
            });
        }
        removeDeployment(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverFilter = server => server.publishState === rsp_client_1.ServerState.PUBLISH_STATE_NONE ||
                        server.publishState === rsp_client_1.ServerState.PUBLISH_STATE_INCREMENTAL ||
                        server.publishState === rsp_client_1.ServerState.PUBLISH_STATE_UNKNOWN;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to remove deployment from', serverFilter);
                    if (!serverId)
                        return null;
                    const deployables = this.explorer.getServerStateById(rsp.id, serverId).deployableStates.map(value => {
                        return {
                            label: value.reference.label,
                            deployable: value
                        };
                    });
                    const deployment = yield vscode.window.showQuickPick(deployables, { placeHolder: 'Select deployment to remove' });
                    if (!deployment || !deployment.deployable)
                        return null;
                    context = deployment.deployable;
                }
                return this.explorer.removeDeployment(context.rsp, context.server, context.reference);
            });
        }
        publishServer(publishType, context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverId = yield this.selectServer(rsp.id, 'Select server to publish');
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                const isAsync = vscode.workspace.getConfiguration('rsp-ui').get(`enableAsyncPublish`);
                return this.explorer.publish(context.rsp, context.server, publishType, isAsync);
            });
        }
        createServer(context) {
            return __awaiter(this, void 0, void 0, function* () {
                this.assertExplorerExists();
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to use to create a server');
                    if (!rsp || !rsp.id)
                        return;
                    context = this.explorer.RSPServersStatus.get(rsp.id).state;
                }
                const download = yield vscode.window.showQuickPick(['Yes', 'No, use server on disk'], { placeHolder: 'Download server?', ignoreFocusOut: true });
                if (!download) {
                    return;
                }
                if (download.startsWith('Yes')) {
                    return this.downloadRuntime(context.type.id);
                }
                else if (download.startsWith('No')) {
                    return this.addLocation(context.type.id);
                }
            });
        }
        assertExplorerExists() {
            if (!this.explorer) {
                throw new Error('Runtime Server Protocol (RSP) Server is starting, please try again later.');
            }
        }
        addLocation(rspId) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.explorer) {
                    if (!rspId) {
                        const rsp = yield this.selectRSP('Select RSP provider you want to use');
                        if (!rsp || !rsp.id)
                            return;
                        rspId = rsp.id;
                    }
                    return this.explorer.addLocation(rspId);
                }
                else {
                    return Promise.reject('Runtime Server Protocol (RSP) Server is starting, please try again later.');
                }
            });
        }
        downloadRuntime(rspId) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!rspId) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to use');
                    if (!rsp || !rsp.id)
                        return;
                    rspId = rsp.id;
                }
                const client = this.explorer.getClientByRSP(rspId);
                if (!client) {
                    return Promise.reject('Failed to contact the RSP server.');
                }
                const rtId = yield this.promptDownloadableRuntimes(client);
                if (!rtId) {
                    return;
                }
                let response = yield this.initEmptyDownloadRuntimeRequest(rtId, client);
                if (!response) {
                    return;
                }
                while (true) {
                    const workflowMap = {};
                    const status = yield this.handleWorkflow(response, workflowMap);
                    if (!status) {
                        return;
                    }
                    else if (!rsp_client_1.StatusSeverity.isInfo(status)) {
                        return status;
                    }
                    // Now we have a data map
                    response = yield this.initDownloadRuntimeRequest(rtId, workflowMap, response.requestId, client);
                }
            });
        }
        serverActions(context) {
            return __awaiter(this, void 0, void 0, function* () {
                this.assertExplorerExists();
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverId = yield this.selectServer(rsp.id, 'Select server you want to retrieve info about');
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                const client = this.explorer.getClientByRSP(context.rsp);
                if (!client) {
                    return Promise.reject(`Failed to contact the RSP server ${context.rsp}.`);
                }
                const action = yield this.chooseServerActions(context.server, client);
                if (!action) {
                    return;
                }
                return yield this.executeServerAction(action, context, client);
            });
        }
        chooseServerActions(server, client) {
            return __awaiter(this, void 0, void 0, function* () {
                const actionsList = yield client.getOutgoingHandler().listServerActions(server)
                    .then((response) => {
                    return response.workflows.map(action => {
                        return {
                            label: action.actionLabel,
                            id: action.actionId,
                            actionWorkflow: action.actionWorkflow
                        };
                    });
                });
                if (actionsList.length === 0) {
                    vscode.window.showInformationMessage('there are no additional actions for this server');
                    return;
                }
                const answer = yield vscode.window.showQuickPick(actionsList, { placeHolder: 'Please choose the action you want to execute.' });
                if (!answer) {
                    return;
                }
                else {
                    return answer;
                }
            });
        }
        executeServerAction(action, context, client) {
            return __awaiter(this, void 0, void 0, function* () {
                const workflowMap = {};
                yield this.handleWorkflow(action.actionWorkflow, workflowMap);
                const actionRequest = {
                    actionId: action.id,
                    data: workflowMap,
                    requestId: null,
                    serverId: context.server.id
                };
                let response = yield client.getOutgoingHandler().executeServerAction(actionRequest);
                if (!response) {
                    return;
                }
                while (true) {
                    const workflowMap = {};
                    const status = yield this.handleWorkflow(response, workflowMap);
                    if (!status) {
                        return;
                    }
                    else if (!rsp_client_1.StatusSeverity.isInfo(status)) {
                        return status;
                    }
                    actionRequest.requestId = response.requestId;
                    actionRequest.data = workflowMap;
                    // Now we have a data map
                    response = yield client.getOutgoingHandler().executeServerAction(actionRequest);
                }
            });
        }
        handleWorkflow(response, workflowMap) {
            return __awaiter(this, void 0, void 0, function* () {
                if (rsp_client_1.StatusSeverity.isError(response.status)
                    || rsp_client_1.StatusSeverity.isCancel(response.status)) {
                    // error
                    return Promise.reject(response.status);
                }
                // not complete, not an error.
                if (!workflowMap) {
                    workflowMap = {};
                }
                if (response.items) {
                    for (const item of response.items) {
                        const strategy = new workflowResponseStrategyManager_1.WorkflowResponseStrategyManager().getStrategy(item.itemType);
                        const canceled = yield strategy.handler(item, workflowMap);
                        if (canceled) {
                            return;
                        }
                    }
                }
                return Promise.resolve(response.status);
            });
        }
        editServer(context) {
            return __awaiter(this, void 0, void 0, function* () {
                if (context === undefined) {
                    const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                    if (!rsp || !rsp.id)
                        return null;
                    const serverId = yield this.selectServer(rsp.id, 'Select server you want to retrieve info about');
                    if (!serverId)
                        return null;
                    context = this.explorer.getServerStateById(rsp.id, serverId);
                }
                if (this.explorer) {
                    return this.explorer.editServer(context.rsp, context.server);
                }
                else {
                    return Promise.reject('Runtime Server Protocol (RSP) Server is starting, please try again later.');
                }
            });
        }
        runOnServer(uri, mode) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!this.explorer) {
                    return Promise.reject('Runtime Server Protocol (RSP) Server is starting, please try again later.');
                }
                const rsp = yield this.selectRSP('Select RSP provider you want to retrieve servers');
                if (!rsp || !rsp.id)
                    return;
                const serverId = yield this.selectServer(rsp.id, 'Select server you want to retrieve info about');
                if (!serverId)
                    return;
                const context = this.explorer.getServerStateById(rsp.id, serverId);
                yield this.explorer.addDeployment([uri], context);
                const isAsync = vscode.workspace.getConfiguration('rsp-ui').get(`enableAsyncPublish`);
                yield this.explorer.publish(rsp.id, context.server, rsp_client_1.ServerState.PUBLISH_FULL, isAsync);
                if (context.state === rsp_client_1.ServerState.STOPPED ||
                    context.state === rsp_client_1.ServerState.UNKNOWN) {
                    if (mode === rsp_client_1.ServerState.RUN_MODE_RUN) {
                        yield this.startServer(mode, context);
                    }
                    else {
                        yield this.debugServer(context);
                    }
                }
                else if (context.state === rsp_client_1.ServerState.STARTED) {
                    if (!(context.runMode === rsp_client_1.ServerState.RUN_MODE_RUN &&
                        mode === rsp_client_1.ServerState.RUN_MODE_RUN)) {
                        yield this.restartServer(mode, context);
                    }
                }
                else {
                    return Promise.reject(`Unable to add deployment and run it on server ${context.server.id}. Stop/start the server and try again.`);
                }
            });
        }
        saveSelectedNode(server) {
            return __awaiter(this, void 0, void 0, function* () {
                this.explorer.nodeSelected = server;
            });
        }
        selectRSP(message, predicateFilter) {
            return __awaiter(this, void 0, void 0, function* () {
                const rspProviders = Array.from(this.explorer.RSPServersStatus.values()).
                    filter(predicateFilter ? predicateFilter : value => value.state.state === rsp_client_1.ServerState.STARTED).
                    map(rsp => {
                    return {
                        label: (!rsp.state.type.visibilename ?
                            rsp.state.type.id :
                            rsp.state.type.visibilename),
                        id: rsp.state.type.id
                    };
                });
                if (rspProviders.length < 1) {
                    return Promise.reject('There are no RSP providers to choose from.');
                }
                if (rspProviders.length === 1) {
                    return rspProviders[0];
                }
                return yield vscode.window.showQuickPick(rspProviders, { placeHolder: message });
            });
        }
        selectServer(rspId, message, stateFilter) {
            return __awaiter(this, void 0, void 0, function* () {
                let servers = this.explorer.getServerStatesByRSP(rspId);
                if (stateFilter) {
                    servers = servers.filter(stateFilter);
                }
                if (!servers || servers.length < 1) {
                    return Promise.reject('There are no servers to choose from.');
                }
                if (servers.length > 1 &&
                    this.explorer.nodeSelected &&
                    'deployableStates' in this.explorer.nodeSelected &&
                    this.explorer.nodeSelected.rsp === rspId) {
                    servers = servers.filter(node => node.server.id !== this.explorer.nodeSelected.server.id);
                    servers.unshift(this.explorer.nodeSelected);
                }
                return vscode.window.showQuickPick(servers.map(server => server.server.id), { placeHolder: message });
            });
        }
        initDownloadRuntimeRequest(id, data1, reqId, client) {
            return __awaiter(this, void 0, void 0, function* () {
                const req = {
                    requestId: reqId,
                    downloadRuntimeId: id,
                    data: data1
                };
                const resp = client.getOutgoingHandler().downloadRuntime(req, 20000);
                return resp;
            });
        }
        initEmptyDownloadRuntimeRequest(id, client) {
            return __awaiter(this, void 0, void 0, function* () {
                const req = {
                    requestId: null,
                    downloadRuntimeId: id,
                    data: {}
                };
                const resp = client.getOutgoingHandler().downloadRuntime(req);
                return resp;
            });
        }
        promptDownloadableRuntimes(client) {
            return __awaiter(this, void 0, void 0, function* () {
                const newlist = client.getOutgoingHandler().listDownloadableRuntimes(CommandHandler.LIST_RUNTIMES_TIMEOUT)
                    .then((list) => __awaiter(this, void 0, void 0, function* () {
                    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
                    const rts = list.runtimes.sort((runtimeA, runtimeB) => collator.compare(runtimeA.name, runtimeB.name));
                    const newlist = [];
                    for (const rt of rts) {
                        newlist.push({ label: rt.name, id: rt.id });
                    }
                    return newlist;
                }));
                const answer = yield vscode.window.showQuickPick(newlist, { placeHolder: 'Please choose a server to download.' });
                console.log(`${answer} was chosen`);
                if (!answer) {
                    return null;
                }
                else {
                    return answer.id;
                }
            });
        }
        checkExtension(debugInfo) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!debugInfo) {
                    return `Could not find server debug info.`;
                }
                if (!debugInfo.isJavaType()) {
                    return `vscode-rsp-ui doesn\'t support debugging with ${debugInfo.getType()} language at this time.`;
                }
                if (this.hasJavaDebugExtension()) {
                    return 'Debugger for Java extension is required. Install/Enable it before proceeding.';
                }
            });
        }
        hasJavaDebugExtension() {
            return vscode.extensions.getExtension('vscjava.vscode-java-debug') === undefined;
        }
        onStdoutData(rspId, data) {
            const rspserverstdout = this.explorer.getRSPOutputChannel(rspId);
            this.displayLog(rspserverstdout, data.toString());
        }
        onStderrData(rspId, data) {
            const rspserverstderr = this.explorer.getRSPErrorChannel(rspId);
            this.displayLog(rspserverstderr, data.toString());
        }
        displayLog(outputPanel, message, show = true) {
            if (outputPanel) {
                if (show)
                    outputPanel.show();
                outputPanel.appendLine(message);
            }
        }
        setRSPListener(rspId, rspProvider) {
            return __awaiter(this, void 0, void 0, function* () {
                rspProvider.onRSPServerStateChanged(state => {
                    this.explorer.updateRSPServer(rspId, state);
                });
            });
        }
        activate(rspId, client) {
            return __awaiter(this, void 0, void 0, function* () {
                client.getIncomingHandler().onServerAdded(handle => {
                    this.explorer.insertServer(rspId, handle);
                });
                client.getIncomingHandler().onServerRemoved(handle => {
                    this.explorer.removeServer(rspId, handle);
                });
                client.getIncomingHandler().onServerStateChanged(event => {
                    this.explorer.updateServer(rspId, event);
                });
                client.getIncomingHandler().onServerProcessOutputAppended(event => {
                    this.explorer.addServerOutput(event);
                });
            });
        }
    }
    CommandHandler.LIST_RUNTIMES_TIMEOUT = 20000;
    return CommandHandler;
})();
exports.CommandHandler = CommandHandler;
//# sourceMappingURL=extensionApi.js.map