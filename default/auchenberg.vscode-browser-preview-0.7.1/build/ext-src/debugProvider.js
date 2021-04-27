"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class DebugProvider {
    constructor(windowManager, telemetry) {
        this.windowManager = windowManager;
        this.telemetry = telemetry;
        vscode.debug.onDidTerminateDebugSession((e) => {
            if (e.name === `Browser Preview: Launch` && e.configuration.urlFilter) {
                // TODO: Improve this with some unique ID per browser window instead of url, to avoid closing multiple instances
                this.windowManager.disposeByUrl(e.configuration.urlFilter);
            }
        });
    }
    getProvider() {
        let manager = this.windowManager;
        let telemetry = this.telemetry;
        return {
            provideDebugConfigurations(folder, token) {
                return Promise.resolve([
                    {
                        type: 'browser-preview',
                        name: 'Browser Preview: Attach',
                        request: 'attach'
                    },
                    {
                        type: `browser-preview`,
                        request: `launch`,
                        name: `Browser Preview: Launch`,
                        url: `http://localhost:3000`
                    }
                ]);
            },
            resolveDebugConfiguration(folder, config, token) {
                let debugConfig = {
                    name: `Browser Preview`,
                    type: `chrome`,
                    request: 'attach',
                    webRoot: config.webRoot,
                    pathMapping: config.pathMapping,
                    trace: config.trace,
                    sourceMapPathOverrides: config.sourceMapPathOverrides,
                    urlFilter: '',
                    url: '',
                    port: null
                };
                if (config && config.type === 'browser-preview') {
                    telemetry.sendEvent('openDebug', {
                        type: config.request
                    });
                    if (config.request && config.request === `attach`) {
                        debugConfig.name = `Browser Preview: Attach`;
                        debugConfig.port = manager.getDebugPort();
                        if (debugConfig.port === null) {
                            vscode.window.showErrorMessage('No Browser Preview window was found. Open a Browser Preview window or use the "launch" request type.');
                        }
                        else {
                            vscode.debug.startDebugging(folder, debugConfig);
                        }
                    }
                    else if (config.request && config.request === `launch`) {
                        debugConfig.name = `Browser Preview: Launch`;
                        debugConfig.urlFilter = config.url;
                        // Launch new preview tab, set url filter, then attach
                        var launch = vscode.commands.executeCommand(`browser-preview.openPreview`, config.url);
                        launch.then(() => {
                            setTimeout(() => {
                                debugConfig.port = manager.getDebugPort();
                                vscode.debug.startDebugging(folder, debugConfig);
                            }, 1000);
                        });
                    }
                }
                else {
                    vscode.window.showErrorMessage('No supported launch config was found.');
                }
                return;
            }
        };
    }
}
exports.default = DebugProvider;
//# sourceMappingURL=debugProvider.js.map