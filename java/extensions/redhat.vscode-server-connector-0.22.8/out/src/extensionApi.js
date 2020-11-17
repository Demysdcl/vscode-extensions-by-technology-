"use strict";
/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the EPL v2.0 License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
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
const constants_1 = require("./constants");
const events_1 = require("events");
const path = require("path");
const server = require("./server");
const vscode_1 = require("vscode");
const vscode_server_connector_api_1 = require("vscode-server-connector-api");
class ExtensionAPI {
    constructor() {
        this.host = '';
        this.port = 0;
        this.emitter = new events_1.EventEmitter();
    }
    startRSP(stdoutCallback, stderrCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateRSPStateChanged(vscode_server_connector_api_1.ServerState.STARTING);
            return yield server.start(stdoutCallback, stderrCallback, this).then(serverInfo => {
                this.host = serverInfo.host;
                this.port = serverInfo.port;
                this.updateRSPStateChanged(vscode_server_connector_api_1.ServerState.STARTED);
                return serverInfo;
            }).catch(error => {
                this.updateRSPStateChanged(vscode_server_connector_api_1.ServerState.STOPPED);
                return Promise.reject(`RSP Error - ${constants_1.RSP_PROVIDER_NAME} failed to start - ${error ? error : ''}`);
            });
        });
    }
    stopRSP() {
        return __awaiter(this, void 0, void 0, function* () {
            server.terminate().catch(error => {
                return Promise.reject(`RSP Error - ${error ? error : ''}`);
            });
        });
    }
    getImage(serverType) {
        if (!serverType) {
            return null;
        }
        return vscode_1.Uri.file(path.join(__dirname, '..', '..', 'images', this.getFilename(serverType)));
    }
    getFilename(serverType) {
        if (serverType.startsWith('org.jboss.ide.eclipse.as.7')) {
            return 'jbossas7_ligature.svg';
        }
        else if (serverType.startsWith('org.jboss.ide.eclipse.as.wildfly.')) {
            return 'wildfly_icon.svg';
        }
        else if (serverType.startsWith('org.jboss.ide.eclipse.as.eap.')) {
            return 'jboss.eap.png';
        }
        else if (serverType.startsWith('org.jboss.tools.openshift.cdk.server.type')) {
            return 'Logotype_RH_OpenShift.svg';
        }
        else {
            return 'server-light.png';
        }
    }
    onRSPServerStateChanged(listener) {
        this.emitter.on('rspServerStateChanged', listener);
    }
    updateRSPStateChanged(state) {
        return __awaiter(this, void 0, void 0, function* () {
            this.emitter.emit('rspServerStateChanged', state);
        });
    }
    getHost() {
        return this.host;
    }
    getPort() {
        return this.port;
    }
}
exports.ExtensionAPI = ExtensionAPI;
//# sourceMappingURL=extensionApi.js.map