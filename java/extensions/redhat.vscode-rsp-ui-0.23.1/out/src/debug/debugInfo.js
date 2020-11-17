"use strict";
/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the EPL v2.0 License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugInfo = void 0;
class DebugInfo {
    constructor(details) {
        this.details = details;
    }
    isJavaType() {
        return this.getType() != null
            && this.getType().indexOf('java') >= 0;
    }
    getType() {
        return this.getDetailsProperty('debug.details.type');
    }
    getPort() {
        return this.getDetailsProperty('debug.details.port');
    }
    getDetailsProperty(identifier) {
        if (!this.details
            || !this.details.properties) {
            return null;
        }
        return this.details.properties[identifier];
    }
}
exports.DebugInfo = DebugInfo;
//# sourceMappingURL=debugInfo.js.map