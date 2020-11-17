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
const cp = require("child_process");
const path = require("path");
const portfinder = require("portfinder");
const requirements = require("./requirements");
const vscode = require("vscode");
const vscode_server_connector_api_1 = require("vscode-server-connector-api");
const waitOn = require("wait-on");
const tcpPort = require("tcp-port-used");
const fs = require('fs-extra');
let cpProcess;
let javaHome;
let port;
const rspid = 'redhat-server-connector';
function start(stdoutCallback, stderrCallback, api) {
    return requirements.resolveRequirements()
        .catch(error => {
        // show error
        vscode.window.showErrorMessage(error.message, ...error.btns.map(btn => btn.label))
            .then(selection => {
            const btnSelected = error.btns.find(btn => btn.label === selection);
            if (btnSelected) {
                if (btnSelected.openUrl) {
                    vscode.commands.executeCommand('vscode.open', btnSelected.openUrl);
                }
                else {
                    vscode.window.showInformationMessage(`To configure Java for Server Connector Extension add "java.home" property to your settings file
                        (ex. "java.home": "/usr/local/java/jdk1.8.0_45").`);
                    vscode.commands.executeCommand('workbench.action.openSettingsJson');
                }
            }
        });
        // rethrow to disrupt the chain.
        throw error;
    })
        .then(requirements => {
        javaHome = requirements.java_home;
        const options = {
            port: 8500,
            stopPort: 9000
        };
        return portfinder.getPortPromise(options);
    })
        .then((serverPort) => __awaiter(this, void 0, void 0, function* () {
        port = serverPort;
        const serverLocation = getServerLocation(process);
        if (yield isWorkspaceLocked()) {
            return Promise.reject('Workspace is locked. Please verify workspace is not in use');
        }
        startServer(serverLocation, serverPort, javaHome, stdoutCallback, stderrCallback, api);
        // return  new Promise(resolve=>{
        //  setTimeout(resolve, 5000)
        // });
        return waitOn({ resources: [`tcp:localhost:${serverPort}`] });
    }))
        .then(() => {
        if (!port) {
            return Promise.reject('Could not allocate a port for the rsp server to listen on.');
        }
        else {
            return Promise.resolve({
                port: port,
                host: 'localhost'
            });
        }
    })
        .catch(error => {
        console.log(error);
        return Promise.reject(error);
    });
}
exports.start = start;
function isWorkspaceLocked() {
    return __awaiter(this, void 0, void 0, function* () {
        let isLocked = true;
        let root = './';
        if (process.platform === 'win32') {
            root = process.env.USERPROFILE;
        }
        const lockFile = path.resolve(root, '.rsp', rspid, '.lock');
        if (fs.existsSync(lockFile)) {
            const port = yield fs.readFile(lockFile, 'utf8');
            const isBusy = yield tcpPort.check(+port);
            if (!isBusy) {
                yield fs.unlink(lockFile);
                isLocked = false;
            }
        }
        else {
            isLocked = false;
        }
        return isLocked;
    });
}
function getServerLocation(process) {
    return process.env.RSP_SERVER_LOCATION ?
        process.env.RSP_SERVER_LOCATION : path.resolve(__dirname, '..', '..', 'server');
}
function startServer(location, port, javaHome, stdoutCallback, stderrCallback, api) {
    const felix = path.join(location, 'bin', 'felix.jar');
    const java = path.join(javaHome, 'bin', 'java');
    // Debuggable version
    // const process = cp.spawn(java, [`-Xdebug`, `-Xrunjdwp:transport=dt_socket,server=y,address=8001,suspend=y`, `-Drsp.server.port=${port}`, '-jar', felix], { cwd: location });
    // Production version
    cpProcess = cp.spawn(java, [`-Drsp.server.port=${port}`, `-Dorg.jboss.tools.rsp.id=${rspid}`, '-Dlogback.configurationFile=./conf/logback.xml', '-jar', felix], { cwd: location });
    cpProcess.stdout.on('data', stdoutCallback);
    cpProcess.stderr.on('data', stderrCallback);
    cpProcess.on('close', () => {
        if (api != null) {
            api.updateRSPStateChanged(vscode_server_connector_api_1.ServerState.STOPPED);
        }
    });
    cpProcess.on('exit', () => {
        if (api != null) {
            api.updateRSPStateChanged(vscode_server_connector_api_1.ServerState.STOPPED);
        }
    });
}
function terminate() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!cpProcess) {
                cpProcess.removeAllListeners();
                cpProcess.kill();
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
    });
}
exports.terminate = terminate;
//# sourceMappingURL=server.js.map