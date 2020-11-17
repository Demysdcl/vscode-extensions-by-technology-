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
exports.rspServerProviderActionsTest = void 0;
const vscode_extension_tester_1 = require("vscode-extension-tester");
const serverUtils_1 = require("./common/util/serverUtils");
const chai_1 = require("chai");
const assert_1 = require("assert");
const os = require("os");
const adaptersContants_1 = require("./common/adaptersContants");
const serverConstants_1 = require("./common/serverConstants");
const serverState_1 = require("./common/enum/serverState");
const downloadServerUtil_1 = require("./common/util/downloadServerUtil");
const serversTab_1 = require("./server/ui/serversTab");
const ERROR_CREATE_NEW_SERVER = 'Unable to create the server';
const ERROR_NO_RSP_PROVIDER = 'there are no rsp providers to choose from';
const YES = 'Yes';
const USE_FROM_DISK = 'No, use server on disk';
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
function rspServerProviderActionsTest() {
    describe('Verify RSP Server provider actions', function () {
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
        it('Verify rsp server provider operation - stop', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(8000);
                yield serverProvider.stop();
            });
        });
        it('Verify rsp server provider operation - terminate', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(8000);
                yield serverProvider.terminate();
            });
        });
        it('Verify rsp server provider operation - Create New Server', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const quick = yield serverProvider.getCreateNewServerBox();
                let options = yield quick.getQuickPicks();
                chai_1.expect(yield Promise.all(options.map((item) => __awaiter(this, void 0, void 0, function* () { return yield item.getText(); })))).to.have.members([YES, USE_FROM_DISK]);
                yield quick.selectQuickPick(YES);
                yield vscode_extension_tester_1.VSBrowser.instance.driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield downloadServerUtil_1.downloadableListIsAvailable(quick); }), 5000);
                const input = yield vscode_extension_tester_1.InputBox.create();
                yield input.setText('WildFly 19');
                let optionsText = yield Promise.all((yield input.getQuickPicks()).map((item) => __awaiter(this, void 0, void 0, function* () { return (yield item.getText()); })));
                yield input.clear();
                yield input.setText('Red Hat EAP');
                optionsText.push(...(yield Promise.all((yield input.getQuickPicks()).map((item) => __awaiter(this, void 0, void 0, function* () { return (yield item.getText()); })))));
                chai_1.expect(optionsText).to.include.members(Object.keys(serverConstants_1.ServersConstants.TEST_SERVERS).map(key => serverConstants_1.ServersConstants.TEST_SERVERS[key]));
                yield quick.cancel();
            });
        });
        it('Verify rsp server provider behavior - cannot create new server on stopped rsp provider', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                yield serverProvider.stop();
                // normally we would be expecting input box to appear
                yield serverProvider.createNewServerCommand();
                let notification;
                try {
                    notification = yield driver.wait(() => { return serverUtils_1.notificationExistsWithObject(ERROR_CREATE_NEW_SERVER); }, 3000);
                }
                catch (error) {
                    console.log(error);
                    const nc = yield new vscode_extension_tester_1.Workbench().openNotificationsCenter();
                    assert_1.fail('Failed to obtain Create new server warning notification, available notifications are: '
                        + (yield Promise.all((yield nc.getNotifications(vscode_extension_tester_1.NotificationType.Any)).map((item) => __awaiter(this, void 0, void 0, function* () { return yield item.getText(); })))));
                }
                chai_1.expect(yield notification.getType()).equals(vscode_extension_tester_1.NotificationType.Warning);
                chai_1.expect(yield notification.getMessage()).to.include(ERROR_NO_RSP_PROVIDER);
            });
        });
        afterEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
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
            });
        });
    });
}
exports.rspServerProviderActionsTest = rspServerProviderActionsTest;
//# sourceMappingURL=rspServerProviderOperationsTest.js.map