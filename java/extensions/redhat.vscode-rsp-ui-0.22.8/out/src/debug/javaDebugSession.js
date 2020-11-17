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
exports.JavaDebugSession = void 0;
const vscode = require("vscode");
class JavaDebugSession {
    constructor() {
    }
    start(server, port, client) {
        this.processOutputListener = {
            port: port,
            server: server,
            listener: output => {
                if (output
                    && output.server
                    && output.server.id === server.id
                    && output.text
                    && output.text.includes('Listening for transport dt_socket')) {
                    this.startDebugger(port);
                    client.getIncomingHandler().removeOnServerProcessOutputAppended(this.processOutputListener.listener);
                }
            }
        };
        client.getIncomingHandler().onServerProcessOutputAppended(this.processOutputListener.listener);
    }
    startDebugger(port) {
        return __awaiter(this, void 0, void 0, function* () {
            this.port = port;
            vscode.debug.startDebugging(undefined, {
                type: 'java',
                request: 'attach',
                name: 'Debug (Remote)',
                hostName: 'localhost',
                port: port
            });
        });
    }
    isDebuggerStarted() {
        return this.port !== undefined;
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand('workbench.action.debug.stop');
            this.port = undefined;
        });
    }
}
exports.JavaDebugSession = JavaDebugSession;
//# sourceMappingURL=javaDebugSession.js.map