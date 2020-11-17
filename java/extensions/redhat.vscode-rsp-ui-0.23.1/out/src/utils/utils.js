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
exports.Utils = void 0;
const vscode = require("vscode");
class Utils {
    static activateExternalProvider(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const extension = yield vscode.extensions.getExtension(id);
            if (!extension) {
                return Promise.reject(`Failed to retrieve ${id} extension`);
            }
            const rspProvider = yield extension.activate();
            if (!rspProvider) {
                return Promise.reject(`Failed to activate ${id} extension`);
            }
            return rspProvider;
        });
    }
    static getIcon(rspId, serverType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!rspId) {
                return null;
            }
            return yield this.activateExternalProvider(rspId).then(rspProvider => {
                const imageUri = rspProvider.getImage(serverType);
                if (imageUri && imageUri.fsPath) {
                    return imageUri.fsPath;
                }
                else {
                    return null;
                }
            }).catch(error => {
                vscode.window.showErrorMessage(error);
                return null;
            });
        });
    }
    static isMultilineText(content) {
        return content && content.indexOf('\n') !== -1;
    }
    static promptUser(item, workflowMap) {
        return __awaiter(this, void 0, void 0, function* () {
            const prompt = item.label + (item.content ? `\n${item.content}` : '');
            let userInput = null;
            if (item.prompt == null || item.prompt.responseType === 'none') {
                userInput = yield new Promise((resolve, reject) => {
                    const msg = prompt.replace(/(\r\n|\n|\r)/gm, '');
                    const quickPick = vscode.window.createQuickPick();
                    quickPick.value = msg;
                    quickPick.ignoreFocusOut = true;
                    quickPick.items = [{ label: 'Continue...', alwaysShow: true, picked: true }];
                    quickPick.onDidChangeSelection(items => {
                        resolve(items[0].label);
                        quickPick.hide();
                    });
                    quickPick.onDidChangeValue(value => {
                        quickPick.value = msg;
                        vscode.window.showInformationMessage('Select Continue... to go to the next step');
                    });
                    quickPick.onDidHide(() => {
                        resolve(undefined);
                        quickPick.dispose();
                    });
                    quickPick.show();
                });
            }
            else {
                if (item.prompt.responseType === 'bool') {
                    const oneProp = yield vscode.window.showQuickPick(['Yes (True)', 'No (False)'], { placeHolder: prompt, ignoreFocusOut: true });
                    userInput = (oneProp === 'Yes (True)');
                }
                else {
                    if (item.prompt.validResponses) {
                        userInput = yield vscode.window.showQuickPick(item.prompt.validResponses, { placeHolder: item.label, ignoreFocusOut: true });
                    }
                    else {
                        const oneProp = yield vscode.window.showInputBox({ prompt: prompt, ignoreFocusOut: true, password: item.prompt.responseSecret });
                        if (item.prompt.responseType === 'int') {
                            userInput = +oneProp;
                        }
                        else {
                            userInput = oneProp;
                        }
                    }
                }
            }
            workflowMap[item.id] = userInput;
            return userInput === undefined;
        });
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map