"use strict";
/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the EPL v2.0 License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
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
exports.DebugInfoProvider = void 0;
const debugInfo_1 = require("./debugInfo");
class DebugInfoProvider {
    static retrieve(server, client) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!server
                || !client) {
                return;
            }
            const launchCommand = yield client.getOutgoingHandler().getLaunchCommand({
                mode: 'debug',
                params: {
                    id: server.id,
                    serverType: server.type.id,
                    attributes: undefined
                }
            });
            return this.create(launchCommand);
        });
    }
    static create(details) {
        if (!details) {
            return;
        }
        return new debugInfo_1.DebugInfo(details);
    }
}
exports.DebugInfoProvider = DebugInfoProvider;
//# sourceMappingURL=debugInfoProvider.js.map