"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const EventEmitter = require("eventemitter2");
const browser_1 = require("./browser");
const BrowserViewWindow_1 = require("./BrowserViewWindow");
class BrowserViewWindowManager extends EventEmitter.EventEmitter2 {
    constructor(extensionPath, telemetry) {
        super();
        this.openWindows = new Set();
        this.telemetry = telemetry;
        this.defaultConfig = {
            extensionPath: extensionPath,
            startUrl: 'http://code.visualstudio.com',
            format: 'jpeg',
            columnNumber: 2
        };
        this.refreshSettings();
        this.on('windowOpenRequested', (params) => {
            this.create(params.url);
        });
    }
    refreshSettings() {
        let extensionSettings = vscode.workspace.getConfiguration('browser-preview');
        if (extensionSettings) {
            let chromeExecutable = extensionSettings.get('chromeExecutable');
            if (chromeExecutable !== undefined) {
                this.defaultConfig.chromeExecutable = chromeExecutable;
            }
            let startUrl = extensionSettings.get('startUrl');
            if (startUrl !== undefined) {
                this.defaultConfig.startUrl = startUrl;
            }
            let isVerboseMode = extensionSettings.get('verbose');
            if (isVerboseMode !== undefined) {
                this.defaultConfig.isVerboseMode = isVerboseMode;
            }
            let format = extensionSettings.get('format');
            if (format !== undefined) {
                this.defaultConfig.format = format.includes('png') ? 'png' : 'jpeg';
            }
        }
    }
    getLastColumnNumber() {
        let lastWindow = Array.from(this.openWindows).pop();
        if (lastWindow) {
            return lastWindow.config.columnNumber;
        }
        return 1;
    }
    async create(startUrl, id) {
        this.refreshSettings();
        let config = { ...this.defaultConfig };
        if (!this.browser) {
            this.browser = new browser_1.default(config, this.telemetry);
        }
        let lastColumnNumber = this.getLastColumnNumber();
        if (lastColumnNumber) {
            config.columnNumber = lastColumnNumber + 1;
        }
        let window = new BrowserViewWindow_1.BrowserViewWindow(config, this.browser, id);
        await window.launch(startUrl);
        window.once('disposed', () => {
            let id = window.id;
            this.openWindows.delete(window);
            if (this.openWindows.size === 0) {
                this.browser.dispose();
                this.browser = null;
            }
            this.emit('windowDisposed', id);
        });
        window.on('windowOpenRequested', (params) => {
            this.emit('windowOpenRequested', params);
        });
        this.openWindows.add(window);
        this.emit('windowCreated', window.id);
        return window;
    }
    getDebugPort() {
        return this.browser ? this.browser.remoteDebugPort : null;
    }
    disposeByUrl(url) {
        this.openWindows.forEach((b) => {
            if (b.config.startUrl == url) {
                b.dispose();
            }
        });
    }
    getByUrl(url) {
        let match = undefined;
        this.openWindows.forEach((b) => {
            if (b.config.startUrl == url) {
                match = b;
            }
        });
        return match;
    }
    getById(id) {
        let match = undefined;
        this.openWindows.forEach((b) => {
            if (b.id == id) {
                match = b;
            }
        });
        return match;
    }
}
exports.BrowserViewWindowManager = BrowserViewWindowManager;
//# sourceMappingURL=BrowserViewWindowManager.js.map