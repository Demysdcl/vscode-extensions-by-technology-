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
exports.WorkflowResponseStrategyPromptSmall = void 0;
const serverEditorAdapter_1 = require("../../serverEditorAdapter");
const serverExplorer_1 = require("../../serverExplorer");
const utils_1 = require("../../utils/utils");
class WorkflowResponseStrategyPromptSmall {
    static doAction(item, workflowMap) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item) {
                return true;
            }
            const explorer = serverExplorer_1.ServerExplorer.getInstance();
            let canceled = false;
            if (utils_1.Utils.isMultilineText(item.content)) {
                yield serverEditorAdapter_1.ServerEditorAdapter.getInstance(explorer).showEditor(item.id, item.content).catch(() => canceled = true);
            }
            else {
                canceled = yield utils_1.Utils.promptUser(item, workflowMap);
            }
            return canceled;
        });
    }
}
exports.WorkflowResponseStrategyPromptSmall = WorkflowResponseStrategyPromptSmall;
//# sourceMappingURL=workflowResponseStrategyPromptSmall.js.map