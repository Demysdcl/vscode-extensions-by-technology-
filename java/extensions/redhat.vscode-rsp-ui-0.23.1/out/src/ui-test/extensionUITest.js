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
exports.extensionUIAssetsTest = void 0;
const adaptersContants_1 = require("./common/adaptersContants");
const chai_1 = require("chai");
const vscode_extension_tester_1 = require("vscode-extension-tester");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
function extensionUIAssetsTest() {
    describe('Verify extension\'s base assets are available after installation', () => {
        let view;
        let sideBar;
        let quickBox;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(4000);
                view = new vscode_extension_tester_1.ActivityBar().getViewControl('Extensions');
                sideBar = yield view.openView();
                quickBox = yield new vscode_extension_tester_1.Workbench().openCommandPrompt();
            });
        });
        it('Command Palette prompt knows RSP commands', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(45000);
                yield verifyCommandPalette(quickBox);
            });
        });
        it('Remote Server Protocol UI extension is installed', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                const section = yield sideBar.getContent().getSection('Enabled');
                const item = yield section.findItem(`@installed ${adaptersContants_1.AdaptersConstants.RSP_UI_NAME}`);
                chai_1.expect(item).not.undefined;
            });
        });
        it('Action button "Create New Server..." from Servers tab is available', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                const explorerView = new vscode_extension_tester_1.ActivityBar().getViewControl('Explorer');
                const bar = yield explorerView.openView();
                const content = bar.getContent();
                const section = yield content.getSection(adaptersContants_1.AdaptersConstants.RSP_SERVERS_LABEL);
                const actionButton = section.getAction(adaptersContants_1.AdaptersConstants.RSP_SERVER_ACTION_BUTTON);
                chai_1.expect(actionButton.getLabel()).to.equal(adaptersContants_1.AdaptersConstants.RSP_SERVER_ACTION_BUTTON);
            });
        });
        it('Servers tab is available under Explorer bar', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(5000);
                const explorerView = new vscode_extension_tester_1.ActivityBar().getViewControl('Explorer');
                chai_1.expect(explorerView).not.undefined;
                const bar = yield explorerView.openView();
                const content = bar.getContent();
                const sections = yield content.getSections();
                chai_1.expect(yield Promise.all(sections.map(item => item.getTitle()))).to.include(adaptersContants_1.AdaptersConstants.RSP_SERVERS_LABEL);
                const section = yield content.getSection(adaptersContants_1.AdaptersConstants.RSP_SERVERS_LABEL);
                chai_1.expect(section).not.undefined;
                chai_1.expect(yield section.getTitle()).to.equal(adaptersContants_1.AdaptersConstants.RSP_SERVERS_LABEL);
                const actionsButton = yield section.getActions();
                chai_1.expect(actionsButton.length).to.equal(1);
                chai_1.expect(actionsButton[0].getLabel()).to.equal(adaptersContants_1.AdaptersConstants.RSP_SERVER_ACTION_BUTTON);
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(4000);
                if (sideBar && (yield sideBar.isDisplayed())) {
                    sideBar = yield new vscode_extension_tester_1.ActivityBar().getViewControl('Extensions').openView();
                    const actionButton = yield sideBar.getTitlePart().getAction('Clear Extensions Input');
                    yield actionButton.click();
                    view.closeView();
                }
                if (quickBox && (yield quickBox.isDisplayed())) {
                    yield quickBox.cancel();
                }
            });
        });
    });
}
exports.extensionUIAssetsTest = extensionUIAssetsTest;
function verifyCommandPalette(quick) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!quick || !(yield quick.isDisplayed())) {
            quick = yield new vscode_extension_tester_1.Workbench().openCommandPrompt();
        }
        yield quick.setText(`>${adaptersContants_1.AdaptersConstants.RSP_COMMAND}`);
        const options = yield quick.getQuickPicks();
        chai_1.expect(yield options[0].getText()).not.equal('No commands matching');
        chai_1.expect(yield options[0].getText()).not.equal('No results found');
        for (const element of adaptersContants_1.AdaptersConstants.RSP_MAIN_COMMANDS) {
            const expression = adaptersContants_1.AdaptersConstants.RSP_COMMAND + ' ' + element;
            yield quick.setText(`>${expression}`);
            const option = yield quick.getQuickPicks();
            const optionsString = yield Promise.all(option.map(item => item.getText()));
            chai_1.expect(optionsString).to.have.members([expression]);
        }
        ;
    });
}
//# sourceMappingURL=extensionUITest.js.map