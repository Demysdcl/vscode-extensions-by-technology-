"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RcpService = void 0;
const rpc = __importStar(require("@open-rpc/client-js"));
const ev = __importStar(require("events"));
const reqUri = 'request';
const resUri = 'response';
class RcpService {
    constructor(redeable, writable) {
        this.emitter = new ev.EventEmitter();
        this.transport = new rpc.EventEmitterTransport(this.emitter, reqUri, resUri);
        this.requestManager = new rpc.RequestManager([this.transport]);
        this.client = new rpc.Client(this.requestManager);
        this.notificationListeners = [];
        this.redeable = redeable;
        this.writable = writable;
        try {
            let self = this;
            // Stdout daemon callback
            this.redeable.on('data', (data) => {
                self.emitRedeable(data);
            });
            // Stdin daemon callback
            this.emitter.on(reqUri, (data) => {
                let request = JSON.stringify(data);
                console.log(`Request sent: ${request}`);
                self.writable.write(request + '\n'); // Send the output correctly from server
            });
            this.client.onNotification((data) => {
                self.notificationListeners.forEach((callback) => callback(data));
            });
            this.client.onError((error) => {
                console.log(`Error ${error.message}`);
            });
        }
        catch (e) {
            console.log(e); // never called
        }
    }
    request(method, params, timeout) {
        return this.client.request(method, params, timeout);
    }
    onNotification(callback) {
        this.notificationListeners.push(callback);
    }
    emitRedeable(data) {
        let list = `${data}`.split('\n').filter((e) => e.trim().length !== 0);
        if (list.length === 0) {
            return;
        }
        let responses = `[ ${list.join(', ')} ]`;
        console.log(`Response received: ${responses}`);
        this.emitter.emit(resUri, responses);
    }
    dispose() {
        this.emitter.removeAllListeners();
    }
}
exports.RcpService = RcpService;
//# sourceMappingURL=rcp.js.map