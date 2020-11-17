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
exports.WorkflowResponseStrategyEditor = void 0;
const serverEditorAdapter_1 = require("../../serverEditorAdapter");
const serverExplorer_1 = require("../../serverExplorer");
class WorkflowResponseStrategyEditor {
    static doAction(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!item) {
                return true;
            }
            let canceled = false;
            let path;
            let content = item.content;
            const explorer = serverExplorer_1.ServerExplorer.getInstance();
            if (item.properties &&
                item.properties.hasOwnProperty('workflow.editor.file.path')) {
                path = item.properties['workflow.editor.file.path'];
            }
            if (item.properties &&
                item.properties.hasOwnProperty('workflow.editor.file.content')) {
                content = item.properties['workflow.editor.file.content'];
            }
            yield serverEditorAdapter_1.ServerEditorAdapter.getInstance(explorer).showEditor(item.id, content, path)
                .catch(() => canceled = true);
            return canceled;
        });
    }
}
exports.WorkflowResponseStrategyEditor = WorkflowResponseStrategyEditor;
//# sourceMappingURL=workflowResponseStrategyEditor.js.map