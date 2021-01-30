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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostMessageIframeTransport = exports.PostMessageWindowTransport = exports.JSONRPCError = exports.WebSocketTransport = exports.EventEmitterTransport = exports.HTTPTransport = exports.RequestManager = exports.Client = void 0;
var RequestManager_1 = __importDefault(require("./RequestManager"));
exports.RequestManager = RequestManager_1.default;
var EventEmitterTransport_1 = __importDefault(require("./transports/EventEmitterTransport"));
exports.EventEmitterTransport = EventEmitterTransport_1.default;
var HTTPTransport_1 = __importDefault(require("./transports/HTTPTransport"));
exports.HTTPTransport = HTTPTransport_1.default;
var WebSocketTransport_1 = __importDefault(require("./transports/WebSocketTransport"));
exports.WebSocketTransport = WebSocketTransport_1.default;
var PostMessageWindowTransport_1 = __importDefault(require("./transports/PostMessageWindowTransport"));
exports.PostMessageWindowTransport = PostMessageWindowTransport_1.default;
var PostMessageIframeTransport_1 = __importDefault(require("./transports/PostMessageIframeTransport"));
exports.PostMessageIframeTransport = PostMessageIframeTransport_1.default;
var Error_1 = require("./Error");
Object.defineProperty(exports, "JSONRPCError", { enumerable: true, get: function () { return Error_1.JSONRPCError; } });
/**
 * OpenRPC Client JS is a browser-compatible JSON-RPC client with multiple transports and
 * multiple request managers to enable features like round-robin or fallback-by-position.
 *
 * @example
 * ```typescript
 * import { RequestManager, HTTPTransport, Client } from '@open-rpc/client-js';
 * const transport = new HTTPTransport('http://localhost:3333');
 * const client = new Client(new RequestManager([transport]));
 * const result = await client.request(‘addition’, [2, 2]);
 * // => { jsonrpc: '2.0', id: 1, result: 4 }
 * ```
 *
 */
var Client = /** @class */ (function () {
    function Client(requestManager) {
        this.requestManager = requestManager;
    }
    /**
     * Initiates [[RequestManager.startBatch]] in order to build a batch call.
     *
     * Subsequent calls to [[Client.request]] will be added to the batch. Once [[Client.stopBatch]] is called, the
     * promises for the [[Client.request]] will then be resolved.  If the [[RequestManager]] already has a batch in
     * progress, this method is a noop.
     *
     * @example
     * myClient.startBatch();
     * myClient.request("foo", ["bar"]).then(() => console.log('foobar'));
     * myClient.request("foo", ["baz"]).then(() => console.log('foobaz'));
     * myClient.stopBatch();
     */
    Client.prototype.startBatch = function () {
        return this.requestManager.startBatch();
    };
    /**
     * Initiates [[RequestManager.stopBatch]] in order to finalize and send the batch to the underlying transport.
     *
     * [[Client.stopBatch]] will send the [[Client.request]] calls made since the last [[Client.startBatch]] call. For
     * that reason, [[Client.startBatch]] MUST be called before [[Client.stopBatch]].
     *
     * @example
     * myClient.startBatch();
     * myClient.request("foo", ["bar"]).then(() => console.log('foobar'));
     * myClient.request("foo", ["baz"]).then(() => console.log('foobaz'));
     * myClient.stopBatch();
     */
    Client.prototype.stopBatch = function () {
        return this.requestManager.stopBatch();
    };
    /**
     * A JSON-RPC call is represented by sending a Request object to a Server.
     *
     * @param method A String containing the name of the method to be invoked. Method names that begin with the word rpc
     * followed by a period character (U+002E or ASCII 46) are reserved for rpc-internal methods and extensions and
     * MUST NOT be used for anything else.
     * @param params A Structured value that holds the parameter values to be used during the invocation of the method.
     */
    Client.prototype.request = function (method, params, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requestManager.connectPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.requestManager.request(method, params, false, timeout)];
                }
            });
        });
    };
    Client.prototype.notify = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.requestManager.connectPromise];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.requestManager.request(method, params, true)];
                }
            });
        });
    };
    Client.prototype.onNotification = function (callback) {
        this.requestManager.requestChannel.addListener("notification", callback);
    };
    Client.prototype.onError = function (callback) {
        this.requestManager.requestChannel.addListener("error", callback);
    };
    return Client;
}());
exports.Client = Client;
exports.default = Client;
