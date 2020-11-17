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
exports.ServerEditorAdapter = void 0;
const fs = require("fs");
const tmp = require("tmp");
const vscode = require("vscode");
class ServerEditorAdapter {
    constructor(explorer) {
        this.explorer = explorer;
        this.RSPServerProperties = new Map();
        this.PREFIX_TMP = 'tmpServerConnector';
    }
    static getInstance(explorer) {
        if (!ServerEditorAdapter.instance) {
            ServerEditorAdapter.instance = new ServerEditorAdapter(explorer);
        }
        return ServerEditorAdapter.instance;
    }
    showEditor(fileSuffix, content, path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!path) {
                const newFile = vscode.Uri.parse('untitled:' + fileSuffix);
                yield vscode.workspace.openTextDocument(newFile).then((document) => __awaiter(this, void 0, void 0, function* () {
                    const edit = new vscode.WorkspaceEdit();
                    edit.insert(newFile, new vscode.Position(0, 0), content);
                    const success = yield vscode.workspace.applyEdit(edit);
                    if (success) {
                        vscode.window.showTextDocument(document);
                    }
                    else {
                        vscode.window.showInformationMessage('Error Displaying Editor Content');
                    }
                }));
            }
            else {
                yield vscode.workspace.openTextDocument(path).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    }
    showServerJsonResponse(rspId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!content || !content.serverHandle || !content.serverJson) {
                return Promise.reject('Could not handle server response: empty/invalid response');
            }
            const rspExists = this.RSPServerProperties.has(rspId);
            if (rspExists) {
                const serverProps = this.RSPServerProperties.get(rspId).find(prop => prop.server === content.serverHandle.id);
                if (serverProps) {
                    return this.saveAndShowEditor(serverProps.file, content.serverJson);
                }
            }
            return this.createTmpFile(rspExists, rspId, content);
        });
    }
    createTmpFile(rspExists, rspId, content) {
        return __awaiter(this, void 0, void 0, function* () {
            return tmp.file({ prefix: `${this.PREFIX_TMP}-${content.serverHandle.id}-`, postfix: '.json' }, (err, path) => {
                if (err) {
                    return Promise.reject('Could not handle server response. Unable to create temp file');
                }
                if (rspExists) {
                    this.RSPServerProperties.get(rspId).push({ server: content.serverHandle.id, file: path });
                }
                else {
                    this.RSPServerProperties.set(rspId, [{ server: content.serverHandle.id, file: path }]);
                }
                this.saveAndShowEditor(path, content.serverJson);
            });
        });
    }
    saveAndShowEditor(path, content) {
        return __awaiter(this, void 0, void 0, function* () {
            fs.writeFile(path, content, undefined, error => {
                if (error !== null) {
                    return Promise.reject(`Unable to save file on path ${path}. Error - ${error}`);
                }
            });
            vscode.workspace.openTextDocument(path).then(doc => vscode.window.showTextDocument(doc));
        });
    }
    onDidSaveTextDocument(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doc) {
                return Promise.reject('Unable to save server properties');
            }
            if (!doc.uri || !doc.uri.fsPath) {
                return Promise.reject('Unable to save server properties - Uri is invalid');
            }
            if (yield this.isTmpServerPropsFile(doc.fileName)) {
                let rspId;
                let serverId;
                for (rspId of this.RSPServerProperties.keys()) {
                    const docInfo = this.RSPServerProperties.get(rspId).find(prop => prop.file.toLowerCase() === doc.uri.fsPath.toLowerCase());
                    if (docInfo) {
                        serverId = docInfo.server;
                        break;
                    }
                }
                if (!serverId) {
                    return Promise.reject('Unable to save server properties - server id is invalid');
                }
                const serverHandle = this.explorer.getServerStateById(rspId, serverId).server;
                if (!serverHandle) {
                    return Promise.reject('Unable to save server properties - server is invalid');
                }
                return this.explorer.saveServerProperties(rspId, serverHandle, doc.getText()).then(updateStatus => {
                    const file = this.RSPServerProperties.get(rspId).find(prop => prop.server === serverHandle.id).file;
                    this.saveAndShowEditor(file, updateStatus.serverJson.serverJson);
                    vscode.window.showInformationMessage(`Server ${serverHandle.id} correctly saved`);
                    return updateStatus.validation.status;
                });
            }
        });
    }
    onDidCloseTextDocument(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!doc) {
                return Promise.reject('Error closing document - document is invalid');
            }
            if (yield this.isTmpServerPropsFile(doc.fileName)) {
                fs.unlink(doc.uri.fsPath, error => {
                    console.log(error);
                });
            }
        });
    }
    isTmpServerPropsFile(docName) {
        return docName.indexOf(`${this.PREFIX_TMP}`) > -1;
    }
}
exports.ServerEditorAdapter = ServerEditorAdapter;
//# sourceMappingURL=serverEditorAdapter.js.map