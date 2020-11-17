"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerState = void 0;
var ServerState;
(function (ServerState) {
    ServerState[ServerState["Unknown"] = 0] = "Unknown";
    ServerState[ServerState["Stopped"] = 1] = "Stopped";
    ServerState[ServerState["Stopping"] = 2] = "Stopping";
    ServerState[ServerState["Starting"] = 3] = "Starting";
    ServerState[ServerState["Started"] = 4] = "Started";
})(ServerState = exports.ServerState || (exports.ServerState = {}));
//# sourceMappingURL=serverState.js.map