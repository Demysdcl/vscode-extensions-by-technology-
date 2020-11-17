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
exports.AbstractServer = void 0;
const vscode_extension_tester_1 = require("vscode-extension-tester");
const vscode_extension_tester_native_1 = require("vscode-extension-tester-native");
const serverState_1 = require("../../common/enum/serverState");
const serverUtils_1 = require("../../common/util/serverUtils");
const adaptersContants_1 = require("../../common/adaptersContants");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
class AbstractServer {
    constructor(name) {
        this._serverName = name;
    }
    get serverName() {
        return this._serverName;
    }
    set serverName(value) {
        this._serverName = value;
    }
    getServerStateLabel() {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield (yield (yield this.getTreeItem()).findElement(vscode_extension_tester_1.By.className('label-description'))).getText();
            return text.slice(text.indexOf('(') + 1, text.indexOf(')'));
        });
    }
    getServerState() {
        return __awaiter(this, void 0, void 0, function* () {
            var label = (yield this.getServerStateLabel());
            return serverState_1.ServerState[label];
        });
    }
    getServerName() {
        return __awaiter(this, void 0, void 0, function* () {
            const item = (yield this.getTreeItem());
            if (!item) {
                throw Error('TreeItem of the object in undefined');
            }
            return item.getLabel();
        });
    }
    performServerOperation(contextMenuItem, expectedState, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (yield this.getTreeItem()).select();
            const treeItem = yield this.getTreeItem();
            yield treeItem.select();
            const menu = yield treeItem.openContextMenu();
            yield menu.select(contextMenuItem);
            yield vscode_extension_tester_1.VSBrowser.instance.driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield serverUtils_1.serverHasState(this, expectedState); }), timeout);
        });
    }
    start(timeout = 10000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performServerOperation(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_START, serverState_1.ServerState.Started, timeout);
        });
    }
    stop(timeout = 10000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performServerOperation(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_STOP, serverState_1.ServerState.Stopped, timeout);
        });
    }
    terminate(timeout = 7000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performServerOperation(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_TERMINATE, serverState_1.ServerState.Stopped, timeout);
        });
    }
    delete() {
        return __awaiter(this, void 0, void 0, function* () {
            const serverItem = yield this.getTreeItem();
            const menu = yield serverItem.openContextMenu();
            if (yield menu.hasItem(adaptersContants_1.AdaptersConstants.SERVER_REMOVE)) {
                yield (yield menu.getItem(adaptersContants_1.AdaptersConstants.SERVER_REMOVE)).click();
                const dialog = yield vscode_extension_tester_native_1.DialogHandler.getOpenDialog();
                yield dialog.confirm();
            }
            else {
                throw Error('Given server ' + this.getServerName() + 'does not allow to remove the server in actual state, could be started');
            }
        });
    }
}
exports.AbstractServer = AbstractServer;
//# sourceMappingURL=abstractServer.js.map