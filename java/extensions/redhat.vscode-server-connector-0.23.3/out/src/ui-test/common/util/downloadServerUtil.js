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
exports.downloadableListIsAvailable = exports.downloadServer = void 0;
const vscode_extension_tester_1 = require("vscode-extension-tester");
const serverUtils_1 = require("./serverUtils");
const adaptersContants_1 = require("../adaptersContants");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
function downloadServer(rsp, serverName) {
    return __awaiter(this, void 0, void 0, function* () {
        const quick = yield rsp.getCreateNewServerBox();
        yield quick.selectQuickPick('Yes');
        yield vscode_extension_tester_1.VSBrowser.instance.driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield this.downloadableListIsAvailable(quick); }), 5000);
        yield quick.setText(serverName);
        yield quick.selectQuickPick(serverName);
        // new editor is opened with license text
        const licenseInput = yield vscode_extension_tester_1.InputBox.create();
        // new box should appear with license confirmation, pick -> (Continue...)
        yield licenseInput.selectQuickPick('Continue...');
        // confirmation leads to next input: do you agree to license? picks -> Yes (True) or No (False)
        yield licenseInput.selectQuickPick('Yes (True)');
        // Clicking yes => Download notification - Job Download runtime: WildFly 19.1.0.Final started.. x
        yield vscode_extension_tester_1.VSBrowser.instance.driver.wait(() => __awaiter(this, void 0, void 0, function* () {
            return yield serverUtils_1.notificationExists(adaptersContants_1.AdaptersConstants.RSP_DOWNLOADING_NOTIFICATION + ' ' + serverName);
        }), 3000);
        // wait for server to get downloaded
        yield vscode_extension_tester_1.VSBrowser.instance.driver.wait(() => __awaiter(this, void 0, void 0, function* () {
            return !(yield serverUtils_1.safeNotificationExists(adaptersContants_1.AdaptersConstants.RSP_DOWNLOADING_NOTIFICATION + ' ' + serverName));
        }), 180000);
    });
}
exports.downloadServer = downloadServer;
function downloadableListIsAvailable(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const picks = yield input.getQuickPicks();
        return picks.length > 0;
    });
}
exports.downloadableListIsAvailable = downloadableListIsAvailable;
//# sourceMappingURL=downloadServerUtil.js.map