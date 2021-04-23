'use strict';
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
exports.activate = void 0;
const VSCode = require("vscode");
function liveHoverConnectHandler() {
    return __awaiter(this, void 0, void 0, function* () {
        //sts.vscode-spring-boot.codeAction
        const processData = yield VSCode.commands.executeCommand('sts/livedata/listProcesses');
        const choiceMap = new Map();
        const choices = [];
        processData.forEach(p => {
            const slash = p.action.lastIndexOf('/');
            if (slash >= 0) {
                var actionLabel = p.action.substring(slash + 1);
                actionLabel = actionLabel.substring(0, 1).toUpperCase() + actionLabel.substring(1);
                const choiceLabel = actionLabel + " " + p.label;
                choiceMap.set(choiceLabel, p);
                choices.push(choiceLabel);
            }
        });
        if (choices) {
            const picked = yield VSCode.window.showQuickPick(choices);
            if (picked) {
                const chosen = choiceMap.get(picked);
                yield VSCode.commands.executeCommand(chosen.action, chosen);
            }
        }
    });
}
/** Called when extension is activated */
function activate(client, options, context) {
    context.subscriptions.push(VSCode.commands.registerCommand('vscode-spring-boot.live-hover.connect', liveHoverConnectHandler));
}
exports.activate = activate;
//# sourceMappingURL=live-hover-connect-ui.js.map