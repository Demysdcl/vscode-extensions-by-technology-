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
exports.ServersTab = void 0;
const vscode_extension_tester_1 = require("vscode-extension-tester");
const adaptersContants_1 = require("../../common/adaptersContants");
const rspServerProvider_1 = require("./rspServerProvider");
const serverUtils_1 = require("../../common/util/serverUtils");
/**
 * Servers tab representation
 * @author Ondrej Dockal <odockal@redhat.com>
 */
class ServersTab {
    constructor() {
        this.viewControl = new vscode_extension_tester_1.ActivityBar().getViewControl('Explorer');
    }
    getSideBarView() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sideBarView || !(yield this.sideBarView.isDisplayed())) {
                throw new Error("Servers side bar was not yet initializaed, call open first");
            }
            return this.sideBarView;
        });
    }
    getViewControl() {
        return this.viewControl;
    }
    open() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.sideBarView) {
                this.sideBarView = yield this.viewControl.openView();
            }
            return this.sideBarView;
        });
    }
    getServerProviderTreeSection() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.open();
            const sideBarView = yield this.getSideBarView();
            yield this.collapseAllSections('Servers');
            yield vscode_extension_tester_1.VSBrowser.instance.driver.wait(() => __awaiter(this, void 0, void 0, function* () { return yield serverUtils_1.sectionHasItem(sideBarView, 'Servers'); }), 3000);
            const section = yield sideBarView.getContent().getSection('Servers');
            yield section.expand();
            return section;
        });
    }
    getServerProvider(name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.open();
            return new rspServerProvider_1.RSPServerProvider(this, name);
        });
    }
    getActionButton() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.open();
            const titlePart = this.sideBarView.getTitlePart();
            return yield titlePart.getAction(adaptersContants_1.AdaptersConstants.RSP_SERVER_PROVIDER_CREATE_NEW_SERVER);
        });
    }
    collapseAllSections(exceptSection) {
        return __awaiter(this, void 0, void 0, function* () {
            const sections = yield (yield this.getSideBarView()).getContent().getSections();
            for (let section of sections) {
                if ((yield section.isExpanded()) && (yield section.getTitle()) != exceptSection) {
                    yield section.collapse();
                }
            }
        });
    }
}
exports.ServersTab = ServersTab;
//# sourceMappingURL=serversTab.js.map