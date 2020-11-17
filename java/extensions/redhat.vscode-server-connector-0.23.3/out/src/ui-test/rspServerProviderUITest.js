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
exports.rspServerProviderUITest = void 0;
const chai_1 = require("chai");
const adaptersContants_1 = require("./common/adaptersContants");
const serverState_1 = require("./common/enum/serverState");
const vscode_extension_tester_1 = require("vscode-extension-tester");
const serverUtils_1 = require("./common/util/serverUtils");
const serversTab_1 = require("./server/ui/serversTab");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
function rspServerProviderUITest() {
    describe('Verify RSP Server provider default behavior', () => {
        let driver;
        before(() => {
            driver = vscode_extension_tester_1.VSBrowser.instance.driver;
        });
        it('Verify rsp server provider tree item is available', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const servers = new serversTab_1.ServersTab();
                yield servers.open();
                const serverProvider = yield servers.getServerProvider(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_NAME);
                chai_1.expect(yield serverProvider.getServerName()).to.include(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_NAME);
            });
        });
        it('Verify rsp server provider is started on startup', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(15000);
                const servers = new serversTab_1.ServersTab();
                yield servers.open();
                const serverProvider = yield servers.getServerProvider(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_NAME);
                // initial server provider is starting automatically on bar activation
                // so one of unknown/starting/started is expected
                const serverState = yield serverProvider.getServerState();
                chai_1.expect([serverState_1.ServerState.Unknown, serverState_1.ServerState.Starting, serverState_1.ServerState.Started]).to.include(serverState);
                // wait for server to get started
                try {
                    yield driver.wait(() => { return serverUtils_1.serverHasState(serverProvider, serverState_1.ServerState.Started); }, 10000);
                }
                catch (error) {
                    throw Error(error + ", Expected server provider to have state Started, but got " + serverState_1.ServerState[yield serverProvider.getServerState()]);
                }
            });
        });
    });
}
exports.rspServerProviderUITest = rspServerProviderUITest;
//# sourceMappingURL=rspServerProviderUITest.js.map