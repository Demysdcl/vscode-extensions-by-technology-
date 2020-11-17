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
exports.deactivate = exports.activate = void 0;
const constants_1 = require("./constants");
const extensionApi_1 = require("./extensionApi");
const vscode_server_connector_api_1 = require("vscode-server-connector-api");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const api = new extensionApi_1.ExtensionAPI();
        const rsp = {
            state: vscode_server_connector_api_1.ServerState.UNKNOWN,
            type: {
                id: constants_1.RSP_PROVIDER_ID,
                visibilename: constants_1.RSP_PROVIDER_NAME
            }
        };
        const serverConnectorUI = yield vscode_server_connector_api_1.retrieveUIExtension();
        if (serverConnectorUI.available) {
            serverConnectorUI.api.registerRSPProvider(rsp);
        }
        return api;
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        const serverConnector = yield vscode_server_connector_api_1.retrieveUIExtension();
        if (serverConnector.available) {
            serverConnector.api.deregisterRSPProvider(constants_1.RSP_PROVIDER_ID);
        }
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map