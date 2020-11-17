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
exports.ServerExplorer = void 0;
const vscode_1 = require("vscode");
const rsp_client_1 = require("rsp-client");
const serverEditorAdapter_1 = require("./serverEditorAdapter");
const utils_1 = require("./utils/utils");
var deploymentStatus;
(function (deploymentStatus) {
    deploymentStatus["file"] = "File";
    deploymentStatus["exploded"] = "Exploded";
})(deploymentStatus || (deploymentStatus = {}));
class ServerExplorer {
    constructor() {
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.serverOutputChannels = new Map();
        this.runStateEnum = new Map();
        this.publishStateEnum = new Map();
        this.serverAttributes = new Map();
        this.RSPServersStatus = new Map();
        this.viewer = vscode_1.window.createTreeView('servers', { treeDataProvider: this });
        this.viewerAB = vscode_1.window.createTreeView('serversAB', { treeDataProvider: this });
        this.viewer.onDidChangeVisibility(this.changeViewer, this);
        this.viewerAB.onDidChangeVisibility(this.changeViewer, this);
        this.runStateEnum
            .set(0, 'Unknown')
            .set(1, 'Starting')
            .set(2, 'Started')
            .set(3, 'Stopping')
            .set(4, 'Stopped');
        this.publishStateEnum
            .set(1, 'Synchronized')
            .set(2, 'Publish Required')
            .set(3, 'Full Publish Required')
            .set(4, '+ Publish Required')
            .set(5, '- Publish Required')
            .set(6, 'Unknown');
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ServerExplorer();
        }
        return this.instance;
    }
    initRSPNode(rspId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getClientByRSP(rspId);
            if (client) {
                const servers = yield client.getOutgoingHandler().getServerHandles();
                servers.forEach((serverHandle) => __awaiter(this, void 0, void 0, function* () {
                    const state = yield client.getOutgoingHandler().getServerState(serverHandle);
                    const serverNode = this.convertToServerStateNode(rspId, state);
                    this.RSPServersStatus.get(rspId).state.serverStates.push(serverNode);
                }));
            }
            this.refresh(this.RSPServersStatus.get(rspId).state);
        });
    }
    insertServer(rspId, event) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getClientByRSP(rspId);
            if (client) {
                const state = yield client.getOutgoingHandler().getServerState(event);
                const serverNode = this.convertToServerStateNode(rspId, state);
                if (serverNode) {
                    this.RSPServersStatus.get(rspId).state.serverStates.push(serverNode);
                    this.refresh(this.RSPServersStatus.get(rspId).state);
                    this.selectNode(Object.assign({ rsp: rspId }, state));
                }
            }
        });
    }
    updateRSPServer(rspId, state) {
        this.RSPServersStatus.get(rspId).state.state = state;
        this.refresh(this.RSPServersStatus.get(rspId).state);
    }
    updateServer(rspId, event) {
        const indexServer = this.RSPServersStatus.get(rspId).state.serverStates.
            findIndex(state => state.server.id === event.server.id);
        const serverToUpdate = this.RSPServersStatus.get(rspId).state.serverStates[indexServer];
        // update serverToUpdate based on event
        Object.keys(event).forEach(key => {
            if (key in serverToUpdate || key === 'runMode') {
                serverToUpdate[key] = event[key];
            }
        });
        serverToUpdate.deployableStates = this.convertToDeployableStateNodes(rspId, event.deployableStates);
        this.RSPServersStatus.get(rspId).state.serverStates[indexServer] = serverToUpdate;
        this.refresh(serverToUpdate);
        const channel = this.serverOutputChannels.get(event.server.id);
        if (event.state === rsp_client_1.ServerState.STARTING && channel) {
            channel.clear();
        }
    }
    convertToServerStateNode(rspId, state) {
        if (state) {
            const deployableNodes = this.convertToDeployableStateNodes(rspId, state.deployableStates);
            return Object.assign(Object.assign({}, state), { rsp: rspId, deployableStates: deployableNodes });
        }
        return undefined;
    }
    convertToDeployableStateNodes(rspId, states) {
        const deployableNodes = [];
        if (states && states.length > 0) {
            for (const deployable of states) {
                const deployableNode = Object.assign({ rsp: rspId }, deployable);
                deployableNodes.push(deployableNode);
            }
        }
        return deployableNodes;
    }
    removeServer(rspId, handle) {
        this.RSPServersStatus.get(rspId).state.serverStates = this.RSPServersStatus.get(rspId).state.serverStates.
            filter(state => state.server.id !== handle.id);
        this.refresh(this.RSPServersStatus.get(rspId).state);
        const channel = this.serverOutputChannels.get(handle.id);
        this.serverOutputChannels.delete(handle.id);
        if (channel) {
            channel.clear();
            channel.dispose();
        }
    }
    addServerOutput(output) {
        let channel = this.serverOutputChannels.get(output.server.id);
        if (channel === undefined) {
            channel = vscode_1.window.createOutputChannel(`Server: ${output.server.id}`);
            this.serverOutputChannels.set(output.server.id, channel);
        }
        channel.append(output.text);
        if (vscode_1.workspace.getConfiguration('vscodeAdapters').get('showChannelOnServerOutput')) {
            channel.show();
        }
    }
    showOutput(state) {
        const channel = this.serverOutputChannels.get(state.server.id);
        if (channel) {
            channel.show();
        }
    }
    refresh(data) {
        this._onDidChangeTreeData.fire(data);
        if (data !== undefined && this.isServerElement(data)) {
            this.selectNode(data);
        }
    }
    selectNode(data) {
        this.nodeSelected = data;
        const tmpViewer = this.viewerAB.visible ? this.viewerAB : this.viewer;
        tmpViewer.reveal(data, { focus: true, select: true });
    }
    changeViewer(_e) {
        if (!this.viewer.visible && !this.viewerAB.visible) {
            return;
        }
        const tmpViewer = this.viewer.visible ? this.viewer : this.viewerAB;
        if (this.nodeSelected) {
            tmpViewer.reveal(this.nodeSelected, { focus: true, select: true });
        }
    }
    selectAndAddDeployment(state) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.createOpenDialogOptions()
                .then(options => options && vscode_1.window.showOpenDialog(options))
                .then((file) => __awaiter(this, void 0, void 0, function* () { return this.addDeployment(file, state); }));
        });
    }
    addDeployment(file, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.RSPServersStatus.get(state.rsp).client;
            if (client && file && file.length === 1) {
                const options = yield this.getDeploymentOptions(client, state);
                if (!options) {
                    return;
                }
                // var fileUrl = require('file-url');
                // const filePath : string = fileUrl(file[0].fsPath);
                const deployableRef = {
                    label: file[0].fsPath,
                    path: file[0].fsPath,
                    options: options
                };
                const req = {
                    server: state.server,
                    deployableReference: deployableRef
                };
                const status = yield client.getOutgoingHandler().addDeployable(req);
                if (!rsp_client_1.StatusSeverity.isOk(status)) {
                    return Promise.reject(status.message);
                }
                return status;
            }
        });
    }
    createOpenDialogOptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const showQuickPick = process.platform === 'win32' ||
                process.platform === 'linux';
            const filePickerType = yield this.quickPickDeploymentType(showQuickPick);
            if (!filePickerType) {
                return;
            }
            // dialog behavior on different OS
            // Windows -> if both options (canSelectFiles and canSelectFolders) are true, fs only shows folders
            // Linux(fedora) -> if both options are true, fs shows both files and folders but files are unselectable
            // Mac OS -> if both options are true, it works correctly
            return {
                canSelectFiles: (showQuickPick ? filePickerType === deploymentStatus.file : true),
                canSelectMany: false,
                canSelectFolders: (showQuickPick ? filePickerType === deploymentStatus.exploded : true),
                openLabel: `Select ${filePickerType} Deployment`
            };
        });
    }
    getDeploymentOptions(client, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const answer = yield vscode_1.window.showQuickPick(['No', 'Yes'], { placeHolder: 'Do you want to edit optional deployment parameters?' });
            const options = {};
            if (!answer) {
                return;
            }
            if (answer === 'Yes') {
                const deployOptionsResponse = yield client.getOutgoingHandler().listDeploymentOptions(state.server);
                const optionMap = deployOptionsResponse.attributes;
                for (const key in optionMap.attributes) {
                    if (key) {
                        const attribute = optionMap.attributes[key];
                        const val = yield vscode_1.window.showInputBox({ prompt: attribute.description,
                            value: attribute.defaultVal, password: attribute.secret });
                        if (val) {
                            options[key] = val;
                        }
                    }
                }
            }
            return options;
        });
    }
    removeDeployment(rspId, server, deployableRef) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getClientByRSP(rspId);
            if (!client) {
                return Promise.reject('Unable to contact the RSP server.');
            }
            const req = {
                server: server,
                deployableReference: deployableRef
            };
            const status = yield client.getOutgoingHandler().removeDeployable(req);
            if (!rsp_client_1.StatusSeverity.isOk(status)) {
                return Promise.reject(status.message);
            }
            return status;
        });
    }
    publish(rspId, server, type, isAsync) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getClientByRSP(rspId);
            if (!client) {
                return Promise.reject('Unable to contact the RSP server.');
            }
            const req = { server: server, kind: type };
            let status;
            if (isAsync) {
                status = yield client.getOutgoingHandler().publishAsync(req);
            }
            else {
                status = yield client.getOutgoingHandler().publish(req);
            }
            if (!rsp_client_1.StatusSeverity.isOk(status)) {
                return Promise.reject(status.message);
            }
            return status;
        });
    }
    addLocation(rspId) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getClientByRSP(rspId);
            if (!client) {
                return Promise.reject('Unable to contact the RSP server.');
            }
            const server = { name: null, bean: null };
            const folders = yield vscode_1.window.showOpenDialog({
                canSelectFiles: false,
                canSelectMany: false,
                canSelectFolders: true,
                openLabel: 'Select desired server location'
            });
            if (!folders
                || folders.length === 0) {
                return;
            }
            const serverBeans = yield client.getOutgoingHandler().findServerBeans({ filepath: folders[0].fsPath });
            if (!serverBeans
                || serverBeans.length === 0
                || !serverBeans[0].serverAdapterTypeId
                || !serverBeans[0].typeCategory
                || serverBeans[0].typeCategory === 'UNKNOWN') {
                throw new Error(`Could not detect any server at ${folders[0].fsPath}!`);
            }
            server.bean = serverBeans[0];
            server.name = yield this.getServerName(rspId);
            if (!server.name) {
                return;
            }
            const attrs = yield this.getRequiredParameters(server.bean, client);
            yield this.getOptionalParameters(server.bean, attrs);
            return this.createServer(server.bean, server.name, attrs, client);
        });
    }
    editServer(rspId, server) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = this.getClientByRSP(rspId);
            if (!client) {
                return Promise.reject(`Unable to contact the RSP server ${rspId}.`);
            }
            const serverProperties = yield client.getOutgoingHandler().getServerAsJson(server);
            if (!serverProperties || !serverProperties.serverJson) {
                return Promise.reject(`Could not load server properties for server ${server.id}`);
            }
            return serverEditorAdapter_1.ServerEditorAdapter.getInstance(this).showServerJsonResponse(rspId, serverProperties);
        });
    }
    saveServerProperties(rspId, serverhandle, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!serverhandle) {
                return Promise.reject('Unable to update server properties - Invalid server');
            }
            if (!content) {
                return Promise.reject(`Unable to update server properties for server ${serverhandle.id} - Invalid content`);
            }
            const client = this.getClientByRSP(rspId);
            if (!client) {
                return Promise.reject('Unable to contact the RSP server.');
            }
            const serverProps = {
                handle: serverhandle,
                serverJson: content
            };
            const response = yield client.getOutgoingHandler().updateServer(serverProps);
            if (!rsp_client_1.StatusSeverity.isOk(response.validation.status)) {
                return Promise.reject(response.validation.status.message);
            }
            return response;
        });
    }
    createServer(bean, name, attributes = {}, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!bean || !name) {
                throw new Error('Couldn\'t create server: no type or name provided.');
            }
            const response = yield client.getServerCreation().createServerFromBeanAsync(bean, name, attributes);
            if (!rsp_client_1.StatusSeverity.isOk(response.status)) {
                throw new Error(response.status.message);
            }
            return response.status;
        });
    }
    getClientByRSP(rspId) {
        if (!this.RSPServersStatus.has(rspId)) {
            return undefined;
        }
        return this.RSPServersStatus.get(rspId).client;
    }
    getRSPOutputChannel(server) {
        if (!this.RSPServersStatus.has(server)) {
            return undefined;
        }
        return this.RSPServersStatus.get(server).rspserverstdout;
    }
    getRSPErrorChannel(server) {
        if (!this.RSPServersStatus.has(server)) {
            return undefined;
        }
        return this.RSPServersStatus.get(server).rspserverstderr;
    }
    disposeRSPProperties(rspId) {
        if (!this.RSPServersStatus.has(rspId)) {
            return;
        }
        const rspProps = this.RSPServersStatus.get(rspId);
        if (rspProps.client) {
            rspProps.client.disconnect();
        }
        if (rspProps.rspserverstdout) {
            rspProps.rspserverstdout.dispose();
        }
        if (rspProps.rspserverstderr) {
            rspProps.rspserverstderr.dispose();
        }
        this.RSPServersStatus.get(rspId).state.serverStates = undefined;
    }
    /**
     * Prompts for server name
     */
    getServerName(rspId) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                prompt: `Provide the server name`,
                placeHolder: `Server name`,
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Cannot set empty server name';
                    }
                    if (this.RSPServersStatus.get(rspId).state.serverStates.find(state => state.server.id === value)) {
                        return 'Cannot set duplicate server nae';
                    }
                }
            };
            return yield vscode_1.window.showInputBox(options);
        });
    }
    /**
     * Requests parameters for the given server and lets user fill the required ones
     */
    getRequiredParameters(bean, client) {
        return __awaiter(this, void 0, void 0, function* () {
            let serverAttribute;
            if (this.serverAttributes.has(bean.serverAdapterTypeId)) {
                serverAttribute = this.serverAttributes.get(bean.serverAdapterTypeId);
            }
            else {
                const req = yield client.getOutgoingHandler().getRequiredAttributes({ id: bean.serverAdapterTypeId, visibleName: '', description: '' });
                const opt = yield client.getOutgoingHandler().getOptionalAttributes({ id: bean.serverAdapterTypeId, visibleName: '', description: '' });
                serverAttribute = { required: req, optional: opt };
                this.serverAttributes.set(bean.serverAdapterTypeId, serverAttribute);
            }
            const attributes = {};
            if (serverAttribute.required
                && serverAttribute.required.attributes
                && Object.keys(serverAttribute.required.attributes).length > 0) {
                for (const key in serverAttribute.required.attributes) {
                    if (key !== 'server.home.dir' && key !== 'server.home.file') {
                        const attribute = serverAttribute.required.attributes[key];
                        const value = yield vscode_1.window.showInputBox({ prompt: attribute.description,
                            value: attribute.defaultVal, password: attribute.secret });
                        if (value) {
                            attributes[key] = value;
                        }
                    }
                    else {
                        attributes[key] = bean.location;
                    }
                }
            }
            return attributes;
        });
    }
    /**
     * Let user choose to fill in optional parameters for a server
     */
    getOptionalParameters(bean, attributes) {
        return __awaiter(this, void 0, void 0, function* () {
            const serverAttribute = this.serverAttributes.get(bean.serverAdapterTypeId);
            if (serverAttribute.optional
                && serverAttribute.optional.attributes
                && Object.keys(serverAttribute.optional.attributes).length > 0) {
                const answer = yield vscode_1.window.showQuickPick(['No', 'Yes'], { placeHolder: 'Do you want to edit optional parameters ?' });
                if (answer === 'Yes') {
                    for (const key in serverAttribute.optional.attributes) {
                        if (key !== 'server.home.dir' && key !== 'server.home.file') {
                            const attribute = serverAttribute.optional.attributes[key];
                            const val = yield vscode_1.window.showInputBox({ prompt: attribute.description,
                                value: attribute.defaultVal, password: attribute.secret });
                            if (val) {
                                attributes[key] = val;
                            }
                        }
                        else {
                            attributes[key] = bean.location;
                        }
                    }
                }
            }
            return attributes;
        });
    }
    quickPickDeploymentType(showQuickPick) {
        return __awaiter(this, void 0, void 0, function* () {
            // quickPick to solve a vscode api bug in windows that only opens file-picker dialog either in file or folder mode
            if (showQuickPick) {
                return yield vscode_1.window.showQuickPick([deploymentStatus.file, deploymentStatus.exploded], { placeHolder: 'What type of deployment do you want to add?' });
            }
            return 'file or exploded';
        });
    }
    getTreeItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isRSPElement(item)) {
                const state = item;
                const id1 = state.type.visibilename;
                const serverState = `${this.runStateEnum.get(state.state)}`;
                const icon = yield utils_1.Utils.getIcon(state.type.id, state.type.id);
                return { label: `${id1}`,
                    description: `(${serverState})`,
                    id: id1,
                    iconPath: icon,
                    contextValue: `RSP${serverState}`,
                    collapsibleState: vscode_1.TreeItemCollapsibleState.Expanded
                };
            }
            else if (this.isServerElement(item)) {
                // item is a serverState
                const state = item;
                const handle = state.server;
                const id1 = handle.id;
                const serverState = (state.state === rsp_client_1.ServerState.STARTED && state.runMode === rsp_client_1.ServerState.RUN_MODE_DEBUG) ?
                    'Debugging' :
                    this.runStateEnum.get(state.state);
                const pubState = this.publishStateEnum.get(state.publishState);
                const icon = yield utils_1.Utils.getIcon(state.rsp, handle.type.id);
                return { label: `${id1}`,
                    description: `(${serverState}) (${pubState})`,
                    id: `${state.rsp}-${id1}`,
                    iconPath: icon,
                    contextValue: serverState,
                    collapsibleState: vscode_1.TreeItemCollapsibleState.Expanded,
                    command: {
                        command: 'server.saveSelectedNode',
                        title: '',
                        tooltip: '',
                        arguments: [state]
                    }
                };
            }
            else if (this.isDeployableElement(item)) {
                const state = item;
                const id1 = state.reference.label;
                const serverState = this.runStateEnum.get(state.state);
                const pubState = this.publishStateEnum.get(state.publishState);
                const icon = yield utils_1.Utils.getIcon(state.rsp, state.server.type.id);
                return { label: `${id1}`,
                    description: `(${serverState}) (${pubState})`,
                    iconPath: icon,
                    contextValue: pubState,
                    collapsibleState: vscode_1.TreeItemCollapsibleState.None
                };
            }
            else {
                return undefined;
            }
        });
    }
    getChildren(element) {
        if (element === undefined) {
            // no parent, root node -> return rsps
            return Array.from(this.RSPServersStatus.values()).map(rsp => rsp.state);
        }
        else if (this.isRSPElement(element) && element.serverStates !== undefined) {
            // rsp parent -> return servers
            return element.serverStates;
        }
        else if (this.isServerElement(element) && element.deployableStates !== undefined) {
            // server parent -> return deployables
            return element.deployableStates;
        }
        else {
            return [];
        }
    }
    getParent(element) {
        if (this.isServerElement(element)) {
            return this.RSPServersStatus.get(element.rsp).state;
        }
        else if (this.isDeployableElement(element)) {
            const rspId = element.rsp;
            return this.RSPServersStatus.get(rspId).state.serverStates.find(state => state.server.id === element.server.id);
        }
        else {
            return undefined;
        }
    }
    getServerStateById(rspId, serverId) {
        return this.RSPServersStatus.get(rspId).state.serverStates.find(x => x.server.id === serverId);
    }
    getServerStatesByRSP(rspId) {
        return this.RSPServersStatus.get(rspId).state.serverStates;
    }
    isRSPElement(element) {
        return element.type !== undefined;
    }
    isServerElement(element) {
        return element.deployableStates !== undefined;
    }
    isDeployableElement(element) {
        return element.reference !== undefined;
    }
}
exports.ServerExplorer = ServerExplorer;
//# sourceMappingURL=serverExplorer.js.map