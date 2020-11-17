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
const adaptersContants_1 = require("./common/adaptersContants");
const chai_1 = require("chai");
const vscode_extension_tester_1 = require("vscode-extension-tester");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
function extensionUIAssetsTest() {
    describe('Verify extension\'s base assets available after install', () => {
        let view;
        let sideBar;
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(4000);
                view = new vscode_extension_tester_1.ActivityBar().getViewControl('Extensions');
                sideBar = yield view.openView();
            });
        });
        it('Dependent Remote Server Protocol UI extension is installed', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                const section = yield sideBar.getContent().getSection('Enabled');
                const item = yield section.findItem(`@installed ${adaptersContants_1.AdaptersConstants.RSP_UI_NAME}`);
                chai_1.expect(item).not.undefined;
            });
        });
        it('Server Connector extension is installed', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                const section = yield sideBar.getContent().getSection('Enabled');
                const item = yield section.findItem(`@installed ${adaptersContants_1.AdaptersConstants.RSP_CONNECTOR_NAME}`);
                chai_1.expect(item).not.undefined;
            });
        });
        afterEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(4000);
                if (sideBar && (yield sideBar.isDisplayed())) {
                    sideBar = yield new vscode_extension_tester_1.ActivityBar().getViewControl('Extensions').openView();
                    const actionButton = yield sideBar.getTitlePart().getAction('Clear Extensions Input');
                    yield actionButton.click();
                }
            });
        });
        after(() => __awaiter(this, void 0, void 0, function* () {
            if (sideBar && (yield sideBar.isDisplayed())) {
                yield view.closeView();
            }
        }));
    });
}
exports.extensionUIAssetsTest = extensionUIAssetsTest;
//# sourceMappingURL=extensionUITest.js.map