'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const browserPage_1 = require("./browserPage");
const vscode = require("vscode");
const os = require("os");
const edge = require("@chiragrupani/karma-chromium-edge-launcher");
const chrome = require("karma-chrome-launcher");
const puppeteer = require('puppeteer-core');
const getPort = require('get-port');
class Browser extends events_1.EventEmitter {
    constructor(config, telemetry) {
        super();
        this.config = config;
        this.remoteDebugPort = 0;
        this.telemetry = telemetry;
    }
    async launchBrowser() {
        let chromePath = this.getChromiumPath();
        let chromeArgs = [];
        let platform = os.platform();
        if (this.config.chromeExecutable) {
            chromePath = this.config.chromeExecutable;
        }
        // Detect remote debugging port
        this.remoteDebugPort = await getPort({ port: 9222, host: '127.0.0.1' });
        chromeArgs.push(`--remote-debugging-port=${this.remoteDebugPort}`);
        if (!chromePath) {
            this.telemetry.sendEvent('error', {
                type: 'chromeNotFound'
            });
            throw new Error(`No Chrome installation found, or no Chrome executable set in the settings - used path ${chromePath}`);
        }
        if (platform === 'linux') {
            chromeArgs.push('--no-sandbox');
        }
        let extensionSettings = vscode.workspace.getConfiguration('browser-preview');
        let ignoreHTTPSErrors = extensionSettings.get('ignoreHttpsErrors');
        this.browser = await puppeteer.launch({
            executablePath: chromePath,
            args: chromeArgs,
            ignoreHTTPSErrors
        });
    }
    async newPage() {
        if (!this.browser) {
            await this.launchBrowser();
        }
        var page = new browserPage_1.default(this.browser);
        await page.launch();
        return page;
    }
    dispose() {
        return new Promise((resolve, reject) => {
            if (this.browser) {
                this.browser.close();
                this.browser = null;
            }
            resolve();
        });
    }
    getChromiumPath() {
        let foundPath = undefined;
        const knownChromiums = [...Object.keys(chrome), ...Object.keys(edge)];
        knownChromiums.forEach((key) => {
            if (foundPath)
                return;
            if (!key.startsWith('launcher'))
                return;
            // @ts-ignore
            const info = chrome[key] || edge[key];
            if (!info[1].prototype)
                return;
            if (!info[1].prototype.DEFAULT_CMD)
                return;
            const possiblePaths = info[1].prototype.DEFAULT_CMD;
            const maybeThisPath = possiblePaths[process.platform];
            if (maybeThisPath && typeof maybeThisPath === 'string') {
                foundPath = maybeThisPath;
            }
        });
        return foundPath;
    }
}
exports.default = Browser;
//# sourceMappingURL=browser.js.map