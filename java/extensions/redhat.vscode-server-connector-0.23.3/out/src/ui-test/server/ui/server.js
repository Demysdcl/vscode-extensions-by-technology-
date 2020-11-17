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
exports.Server = void 0;
const abstractServer_1 = require("./abstractServer");
const adaptersContants_1 = require("../../common/adaptersContants");
const serverState_1 = require("../../common/enum/serverState");
/**
 * RSP Server Provider item representation
 * @author Ondrej Dockal <odockal@redhat.com>
 */
class Server extends abstractServer_1.AbstractServer {
    constructor(name, parent) {
        super(name);
        this._serverParent = parent;
    }
    get serverParent() {
        return this._serverParent;
    }
    set serverParent(value) {
        this._serverParent = value;
    }
    getTreeItem() {
        return __awaiter(this, void 0, void 0, function* () {
            const parent = yield this.serverParent.getTreeItem();
            const treeItem = yield parent.findChildItem(this.serverName);
            return treeItem;
        });
    }
    start(timeout = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performServerOperation(adaptersContants_1.AdaptersConstants.SERVER_START, serverState_1.ServerState.Started, timeout);
        });
    }
    stop(timeout = 20000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performServerOperation(adaptersContants_1.AdaptersConstants.SERVER_STOP, serverState_1.ServerState.Stopped, timeout);
        });
    }
    terminate(timeout = 10000) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.performServerOperation(adaptersContants_1.AdaptersConstants.SERVER_TERMINATE, serverState_1.ServerState.Stopped, timeout);
        });
    }
    restart(timeout = 30000) {
        const _super = Object.create(null, {
            performServerOperation: { get: () => super.performServerOperation }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.performServerOperation.call(this, adaptersContants_1.AdaptersConstants.SERVER_RESTART_RUN, serverState_1.ServerState.Started, timeout);
        });
    }
}
exports.Server = Server;
//# sourceMappingURL=server.js.map