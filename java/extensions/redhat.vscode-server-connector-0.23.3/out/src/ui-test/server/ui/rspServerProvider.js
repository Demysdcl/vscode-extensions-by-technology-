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
exports.RSPServerProvider = void 0;
const vscode_extension_tester_1 = require("vscode-extension-tester");
const adaptersContants_1 = require("../../common/adaptersContants");
const server_1 = require("./server");
const abstractServer_1 = require("./abstractServer");
/**
 * RSP Server Provider item representation
 * @author Ondrej Dockal <odockal@redhat.com>
 */
class RSPServerProvider extends abstractServer_1.AbstractServer {
    constructor(sbar, name) {
        super(name);
        this._serversProvider = sbar;
    }
    get serversProvider() {
        return this._serversProvider;
    }
    getTreeItem() {
        return __awaiter(this, void 0, void 0, function* () {
            const section = yield this.serversProvider.getServerProviderTreeSection();
            vscode_extension_tester_1.VSBrowser.instance.driver.wait(() => __awaiter(this, void 0, void 0, function* () { return (yield section.getVisibleItems()).length > 0; }), 3000);
            const rspServerItem = yield section.findItem(this.serverName);
            if (!rspServerItem) {
                const availableItems = yield Promise.all((yield section.getVisibleItems()).map((item) => __awaiter(this, void 0, void 0, function* () { return yield item.getText(); })));
                throw Error('No item found for name ' + this.serverName + ', available items: ' + availableItems);
            }
            return rspServerItem;
        });
    }
    getServers() {
        return __awaiter(this, void 0, void 0, function* () {
            let servers = [];
            const items = yield (yield this.getTreeItem()).getChildren();
            for (let item of items) {
                const label = yield item.getLabel();
                servers.push(new server_1.Server(label, this));
            }
            return servers;
        });
    }
    getServer(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const items = yield (yield this.getTreeItem()).getChildren();
            for (let item of items) {
                const label = yield item.getLabel();
                if (label === name) {
                    return new server_1.Server(label, this);
                }
            }
            throw Error('Server "' + name + '" does not exist');
        });
    }
    getCreateNewServerBox() {
        return __awaiter(this, void 0, void 0, function* () {
            const item = yield this.getTreeItem();
            const menu = yield item.openContextMenu();
            yield menu.select(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_CREATE_NEW_SERVER);
            return yield vscode_extension_tester_1.InputBox.create();
        });
    }
    createNewServerCommand() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = yield new vscode_extension_tester_1.Workbench().openCommandPrompt();
            yield input.setText('>' + adaptersContants_1.AdaptersConstants.RSP_COMMAND + ' ' + adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_CREATE_NEW_SERVER);
            yield input.confirm();
        });
    }
    delete() {
        throw Error('RSP Server does not support delete operation');
    }
}
exports.RSPServerProvider = RSPServerProvider;
//# sourceMappingURL=rspServerProvider.js.map