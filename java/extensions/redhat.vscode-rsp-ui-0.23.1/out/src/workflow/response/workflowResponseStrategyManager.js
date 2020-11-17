"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowResponseStrategyManager = void 0;
const workflowResponseStrategyBrowser_1 = require("./workflowResponseStrategyBrowser");
const workflowResponseStrategyEditor_1 = require("./workflowResponseStrategyEditor");
const workflowResponseStrategyPromptSmall_1 = require("./workflowResponseStrategyPromptSmall");
const workflowResponseStrategyTerminal_1 = require("./workflowResponseStrategyTerminal");
class WorkflowResponseStrategyManager {
    constructor() {
        this.strategies = [];
        this.strategies.push({
            name: 'workflow.browser.open',
            handler: workflowResponseStrategyBrowser_1.WorkflowResponseStrategyBrowser.doAction
        });
        this.strategies.push({
            name: 'workflow.prompt.small',
            handler: workflowResponseStrategyPromptSmall_1.WorkflowResponseStrategyPromptSmall.doAction
        });
        this.strategies.push({
            name: 'workflow.prompt.large',
            handler: workflowResponseStrategyEditor_1.WorkflowResponseStrategyEditor.doAction
        });
        this.strategies.push({
            name: 'workflow.editor.open',
            handler: workflowResponseStrategyEditor_1.WorkflowResponseStrategyEditor.doAction
        });
        this.strategies.push({
            name: 'workflow.terminal.open',
            handler: workflowResponseStrategyTerminal_1.WorkflowResponseStrategyTerminal.doAction
        });
    }
    getStrategy(name = 'workflow.prompt.small') {
        return this.strategies.find(strategy => strategy.name === name);
    }
}
exports.WorkflowResponseStrategyManager = WorkflowResponseStrategyManager;
//# sourceMappingURL=workflowResponseStrategyManager.js.map