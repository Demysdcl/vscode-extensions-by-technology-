'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const clipboard_1 = require("./clipboard");
var EventEmitterEnhancer = require('event-emitter-enhancer');
var EnhancedEventEmitter = EventEmitterEnhancer.extend(events_1.EventEmitter);
class BrowserPage extends EnhancedEventEmitter {
    constructor(browser) {
        super();
        this.browser = browser;
        this.clipboard = new clipboard_1.default();
    }
    dispose() {
        this.removeAllElseListeners();
        this.removeAllListeners();
        this.client.detach();
        this.page.close();
    }
    async send(action, data, callbackId) {
        console.log('► browserPage.send', action);
        switch (action) {
            case 'Page.goForward':
                await this.page.goForward();
                break;
            case 'Page.goBackward':
                await this.page.goBack();
                break;
            case 'Clipboard.readText':
                this.clipboard.readText().then((result) => {
                    this.emit({
                        callbackId: callbackId,
                        result: result
                    });
                }, (err) => {
                    this.emit({
                        callbackId: callbackId,
                        error: err.message
                    });
                });
                break;
            case 'Clipboard.writeText':
                this.clipboard.writeText(data.value).then((result) => {
                    this.emit({
                        callbackId: callbackId,
                        result: result
                    });
                }, (err) => {
                    this.emit({
                        callbackId: callbackId,
                        error: err.message
                    });
                });
                break;
            default:
                this.client
                    .send(action, data)
                    .then((result) => {
                    this.emit({
                        callbackId: callbackId,
                        result: result
                    });
                })
                    .catch((err) => {
                    this.emit({
                        callbackId: callbackId,
                        error: err.message
                    });
                });
        }
    }
    async launch() {
        this.page = await this.browser.newPage();
        this.client = await this.page.target().createCDPSession();
        EventEmitterEnhancer.modifyInstance(this.client);
        this.client.else((action, data) => {
            console.log('◀ browserPage.received', action);
            this.emit({
                method: action,
                result: data
            });
        });
    }
}
exports.default = BrowserPage;
//# sourceMappingURL=browserPage.js.map