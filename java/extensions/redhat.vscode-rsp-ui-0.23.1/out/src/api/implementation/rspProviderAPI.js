"use strict";
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
exports.getAPI = void 0;
const extension_1 = require("../../extension");
const extensionApi_1 = require("../../extensionApi");
const serverExplorer_1 = require("../../serverExplorer");
const vscode = require("vscode");
function getAPI() {
    return new RSPProviderAPIImpl();
}
exports.getAPI = getAPI;
class RSPProviderAPIImpl {
    constructor() { }
    registerRSPProvider(rsp) {
        return __awaiter(this, void 0, void 0, function* () {
            let error;
            if (!rsp) {
                error = 'Unable to register RSP provider - RSP state is not valid.';
                vscode.window.showErrorMessage(error);
                return Promise.reject(error);
            }
            if (!rsp.type || !rsp.type.id) {
                error = 'Unable to register RSP provider - Id is not valid.';
                vscode.window.showErrorMessage(error);
                return Promise.reject(error);
            }
            const rspserverstdout = vscode.window.createOutputChannel(`${rsp.type.visibilename} (stdout)`);
            const rspserverstderr = vscode.window.createOutputChannel(`${rsp.type.visibilename} (stderr)`);
            const rspState = Object.assign(Object.assign({}, rsp), { serverStates: undefined });
            const rspProperties = {
                state: rspState,
                client: undefined,
                rspserverstderr: rspserverstderr,
                rspserverstdout: rspserverstdout,
                info: undefined
            };
            const serversExplorer = serverExplorer_1.ServerExplorer.getInstance();
            serversExplorer.RSPServersStatus.set(rsp.type.id, rspProperties);
            serversExplorer.refresh();
            const startRSP = yield this.updateRSPActivationSetting(rsp, serversExplorer);
            if (startRSP) {
                if (vscode.window.state.focused) {
                    const commandHandler = new extensionApi_1.CommandHandler(serversExplorer);
                    extension_1.executeCommand(commandHandler.startRSP, commandHandler, rspState, 'Unable to start the RSP server: ');
                }
                else {
                    setTimeout(function () {
                        const commandHandler = new extensionApi_1.CommandHandler(serversExplorer);
                        extension_1.executeCommand(commandHandler.startRSP, commandHandler, rspState, 'Unable to start the RSP server: ');
                    }, 3000);
                }
            }
        });
    }
    updateRSPActivationSetting(rsp, explorer) {
        return __awaiter(this, void 0, void 0, function* () {
            let startRSP = true;
            let existingSettings = vscode.workspace.
                getConfiguration('rsp-ui').
                get(`enableStartServerOnActivation`);
            // unfortunately it seems that the get method (above) works with some cache because
            // if i try to register two or more providers at once for the first time it always return an empty array,
            // it means that the first provider will be overwritten by the second and so on...
            // to prevent this, if an empty array is returned i'll get the servers already registered from RSPServersStatus
            if (!existingSettings || existingSettings.length < 1) {
                existingSettings = Array.from(explorer.RSPServersStatus.values()).
                    map(server => {
                    return {
                        id: server.state.type.id,
                        name: server.state.type.visibilename,
                        startOnActivation: true
                    };
                });
            }
            else {
                const rspAlreadyRegistered = existingSettings.find(setting => setting.id === rsp.type.id);
                if (!rspAlreadyRegistered) {
                    const settingServer = {
                        id: rsp.type.id,
                        name: rsp.type.visibilename,
                        startOnActivation: true
                    };
                    existingSettings.push(settingServer);
                }
                else {
                    startRSP = rspAlreadyRegistered.startOnActivation;
                }
            }
            yield vscode.workspace.getConfiguration('rsp-ui').update(`enableStartServerOnActivation`, existingSettings, true);
            return startRSP;
        });
    }
    deregisterRSPProvider(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                const error = 'Unable to remove RSP provider - Id is not valid.';
                vscode.window.showErrorMessage(error);
                return Promise.reject(error);
            }
            const serversExplorer = serverExplorer_1.ServerExplorer.getInstance();
            if (!serversExplorer.RSPServersStatus.has(id)) {
                const error = 'No RSP Provider was found with this id.';
                return Promise.reject(error);
            }
            serversExplorer.disposeRSPProperties(id);
            serversExplorer.RSPServersStatus.delete(id);
            serversExplorer.refresh();
        });
    }
}
//# sourceMappingURL=rspProviderAPI.js.map