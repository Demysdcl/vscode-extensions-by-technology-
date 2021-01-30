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
const events_1 = require("events");
const client_js_1 = require("@open-rpc/client-js");
const reqUri = "chan1";
const resUri = "chan2";
const emitter = new events_1.EventEmitter();
const transport = new client_js_1.EventEmitterTransport(emitter, reqUri, resUri);
const requestManager = new client_js_1.RequestManager([transport]);
const client = new client_js_1.Client(requestManager);
// event emitter server code
emitter.on(reqUri, (jsonrpcRequest) => {
    console.log(`request ${jsonrpcRequest.id}`);
    const res = {
        jsonrpc: "2.0",
        result: "potato",
        id: jsonrpcRequest.id,
    };
    // emitter.emit(resUri, JSON.stringify(res));
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    client.request("addition", [2, 2]).then((data) => console.log(data));
    client.onNotification((data) => {
        console.log(data);
    });
    client.onError((data) => {
        console.log('error');
        console.log(data);
    });
    const notification = {
        jsonrpc: "2.0",
        method: "notification",
    };
    setTimeout(function () {
        emitter.emit(resUri, JSON.stringify(notification));
    }, 2000);
    client.request("addition2", [2, 2]).then((r) => {
        console.log('response 2');
        console.log(r);
    });
    const res2 = {
        jsonrpc: "2.0",
        result: "potato",
        id: 1
    };
    setTimeout(function () {
        emitter.emit(resUri, JSON.stringify(res2));
    }, 2000);
});
main().then(() => {
    console.log("DONE");
});
//# sourceMappingURL=test.js.map