"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extensionUITest_1 = require("./extensionUITest");
const rspServerProviderUITest_1 = require("./rspServerProviderUITest");
const rspServerProviderOperationsTest_1 = require("./rspServerProviderOperationsTest");
const basicServerTest_1 = require("./basicServerTest");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
describe('VSCode Server Connector - UI tests', () => {
    extensionUITest_1.extensionUIAssetsTest();
    rspServerProviderUITest_1.rspServerProviderUITest();
    rspServerProviderOperationsTest_1.rspServerProviderActionsTest();
    basicServerTest_1.wildflyE2EBasicTest();
});
//# sourceMappingURL=allTestsSuite.js.map