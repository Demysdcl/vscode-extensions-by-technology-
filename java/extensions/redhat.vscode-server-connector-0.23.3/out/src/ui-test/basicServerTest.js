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
exports.wildflyE2EBasicTest = void 0;
const vscode_extension_tester_1 = require("vscode-extension-tester");
const serverUtils_1 = require("./common/util/serverUtils");
const chai_1 = require("chai");
const os = require("os");
const serverState_1 = require("./common/enum/serverState");
const adaptersContants_1 = require("./common/adaptersContants");
const serverConstants_1 = require("./common/serverConstants");
const downloadServerUtil_1 = require("./common/util/downloadServerUtil");
const serversTab_1 = require("./server/ui/serversTab");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
function wildflyE2EBasicTest() {
    describe('Verify that E2E use case scenario for server adapter is working properly', function () {
        let driver;
        let serverProvider;
        let serversTab;
        before(function () {
            if (os.platform() === 'darwin') {
                this.skip();
            }
            driver = vscode_extension_tester_1.VSBrowser.instance.driver;
            serversTab = new serversTab_1.ServersTab();
        });
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield serversTab.open();
                serverProvider = yield serversTab.getServerProvider(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_NAME);
                const state = yield serverProvider.getServerState();
                if (state == serverState_1.ServerState.Unknown || state == serverState_1.ServerState.Starting)
                    yield driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield serverUtils_1.serverHasState(serverProvider, serverState_1.ServerState.Started); }), 10000, "Server was not started within 10 s on startup");
                else if (state != serverState_1.ServerState.Started) {
                    yield serverProvider.start(10000);
                }
            });
        });
        for (let serverName in serverConstants_1.ServersConstants.WILDFLY_SERVERS) {
            const serverDownloadName = serverConstants_1.ServersConstants.WILDFLY_SERVERS[serverName];
            it('Verify ' + serverDownloadName + ' basic features - create server (download), start, restart, stop', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(240000);
                    yield downloadServerUtil_1.downloadServer(serverProvider, serverDownloadName);
                    const servers = yield serverProvider.getServers();
                    const serversNames = yield Promise.all(servers.map((item) => __awaiter(this, void 0, void 0, function* () { return yield item.getServerName(); })));
                    chai_1.expect(serversNames).to.include.members([serverName]);
                    const server = yield serverProvider.getServer(serverName);
                    yield server.start();
                    yield driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield serverUtils_1.serverHasState(server, serverState_1.ServerState.Started); }), 3000);
                    yield server.restart();
                    yield driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield serverUtils_1.serverHasState(server, serverState_1.ServerState.Started); }), 3000);
                    yield server.stop();
                    yield driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield serverUtils_1.serverHasState(server, serverState_1.ServerState.Stopped); }), 3000);
                });
            });
        }
        afterEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                // clean up quick box
                try {
                    yield new vscode_extension_tester_1.InputBox().cancel();
                }
                catch (error) {
                    // no input box, not need to close it
                }
                // clean up notifications
                const nc = yield new vscode_extension_tester_1.Workbench().openNotificationsCenter();
                const notifications = yield nc.getNotifications(vscode_extension_tester_1.NotificationType.Any);
                if (notifications.length > 0) {
                    yield nc.clearAllNotifications();
                }
                yield nc.close();
                yield serverUtils_1.stopAllServers(serverProvider);
                yield serverUtils_1.deleteAllServers(serverProvider);
            });
        });
    });
}
exports.wildflyE2EBasicTest = wildflyE2EBasicTest;
//# sourceMappingURL=basicServerTest.js.map