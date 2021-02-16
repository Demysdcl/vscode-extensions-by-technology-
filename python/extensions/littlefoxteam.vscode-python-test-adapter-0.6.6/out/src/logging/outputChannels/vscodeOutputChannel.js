"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VscodeOutputChannel = void 0;
class VscodeOutputChannel {
    constructor(channel) {
        this.channel = channel;
    }
    write(message) {
        this.channel.appendLine(message);
    }
}
exports.VscodeOutputChannel = VscodeOutputChannel;
//# sourceMappingURL=vscodeOutputChannel.js.map