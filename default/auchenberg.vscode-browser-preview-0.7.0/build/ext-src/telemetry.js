"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Mixpanel = require('mixpanel');
const vscode = require("vscode");
const osName = require('os-name');
const publicIp = require('public-ip');
class Telemetry {
    constructor() {
        this.userId = vscode.env.machineId;
        this.isTelemetryEnabled = false;
        this.ip = '';
        this.getSettingFromConfig();
        this.setup();
        vscode.workspace.onDidChangeConfiguration(this.configurationChanged, this);
    }
    async setup() {
        if (!this.isTelemetryEnabled) {
            return;
        }
        if (this.client) {
            return;
        }
        this.client = Mixpanel.init('d0149f7b700b44a18fa53e2cab03b564');
        let extension = vscode.extensions.getExtension('auchenberg.vscode-browser-preview');
        let extensionVersion = extension ? extension.packageJSON.version : '<none>';
        // Store
        this.ip = await publicIp.v4();
        // Mixpanel
        this.client.people.set(this.userId, {
            sessionId: vscode.env.sessionId,
            language: vscode.env.language,
            vscodeVersion: vscode.version,
            platform: osName(),
            version: extensionVersion,
            ip: this.ip
        });
    }
    sendEvent(eventName, params) {
        if (!this.isTelemetryEnabled) {
            return;
        }
        let data = {
            ...params,
            distinct_id: this.userId,
            ip: this.ip
        };
        // Mixpanel
        this.client.track(eventName, data);
    }
    configurationChanged(e) {
        vscode.window.showInformationMessage('Updated');
        this.getSettingFromConfig();
    }
    getSettingFromConfig() {
        let config = vscode.workspace.getConfiguration('telemetry');
        if (config) {
            let enableTelemetry = config.get('enableTelemetry');
            this.isTelemetryEnabled = !!enableTelemetry;
        }
        if (this.isTelemetryEnabled) {
            this.setup();
        }
    }
}
exports.Telemetry = Telemetry;
//# sourceMappingURL=telemetry.js.map