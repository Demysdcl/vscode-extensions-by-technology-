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
exports.initClient = void 0;
const jobprogress_1 = require("../jobprogress");
const rsp_client_1 = require("rsp-client");
const vscode = require("vscode");
const PROTOCOL_VERSION = '0.23.0';
function initClient(serverInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = new rsp_client_1.RSPClient('localhost', serverInfo.port);
        yield client.connect();
        client.getIncomingHandler().onPromptString(event => {
            return new Promise((resolve, reject) => {
                vscode.window.showInputBox({ prompt: event.prompt, password: true })
                    .then(value => {
                    if (value && value.trim().length) {
                        resolve(value);
                    }
                    else {
                        reject(new Error('Cancelled by user'));
                    }
                });
            });
        });
        client.getOutgoingHandler().registerClientCapabilities({ map: { 'protocol.version': PROTOCOL_VERSION, 'prompt.string': 'true' } });
        jobprogress_1.JobProgress.create(client);
        return client;
    });
}
exports.initClient = initClient;
//# sourceMappingURL=client.js.map