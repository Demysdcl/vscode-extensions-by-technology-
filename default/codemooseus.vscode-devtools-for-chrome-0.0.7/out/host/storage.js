var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class ToolsHost {
    getPreferences(callback) {
        // Load the preference via the extension workspaceState
        this._getStateCallback = callback;
        window.parent.postMessage('getState:', '*');
    }
    setPreference(name, value) {
        // Save the preference via the extension workspaceState
        window.parent.postMessage(`setState:${JSON.stringify({ name, value })}`, '*');
    }
    recordEnumeratedHistogram(actionName, actionCode, bucketSize) {
        // Inform the extension of the chrome telemetry event
        const telemetry = {
            name: `devtools/${actionName}`,
            properties: {},
            metrics: {}
        };
        if (actionName === 'DevTools.InspectElement') {
            telemetry.metrics[`${actionName}.duration`] = actionCode;
        }
        else {
            telemetry.properties[`${actionName}.actionCode`] = actionCode;
        }
        window.parent.postMessage(`telemetry:${JSON.stringify(telemetry)}`, '*');
    }
    fireGetStateCallback(state) {
        const prefs = JSON.parse(state);
        this._getStateCallback(prefs);
    }
}
class ToolsWebSocket {
    constructor(url) {
        window.addEventListener('message', messageEvent => {
            if (messageEvent.data && messageEvent.data[0] !== '{') {
                // Extension websocket control messages
                switch (messageEvent.data) {
                    case 'error':
                        this.onerror();
                        break;
                    case 'close':
                        this.onclose();
                        break;
                    case 'open':
                        this.onopen();
                        break;
                }
            }
            else {
                // Messages from the websocket
                this.onmessage(messageEvent);
            }
        });
        // Inform the extension that we are ready to recieve messages
        window.parent.postMessage('ready', '*');
    }
    send(message) {
        // Forward the message to the extension
        window.parent.postMessage(message, '*');
    }
}
class ToolsResourceLoader {
    constructor(dtWindow) {
        this._window = dtWindow;
        this._realLoadResource = this._window.Runtime.loadResourcePromise;
        this._urlLoadNextId = 0;
        this._urlLoadResolvers = new Map();
        this._window.Runtime.loadResourcePromise = this.loadResource.bind(this);
    }
    resolveUrlRequest(message) {
        // Parse the request from the message and store it
        const response = JSON.parse(message);
        if (this._urlLoadResolvers.has(response.id)) {
            this._urlLoadResolvers.get(response.id)(response.content);
            this._urlLoadResolvers.delete(response.id);
        }
    }
    loadResource(url) {
        return __awaiter(this, void 0, void 0, function* () {
            if (url === 'sources/module.json') {
                // Override the paused event revealer so that hitting a bp will not switch to the sources tab
                const content = yield this._realLoadResource(url);
                return content.replace(/{[^}]+DebuggerPausedDetailsRevealer[^}]+},/gm, '');
            }
            if (url.substr(0, 7) === 'http://' || url.substr(0, 8) === 'https://') {
                // Forward the cross domain request over to the extension
                return new Promise((resolve, reject) => {
                    const id = this._urlLoadNextId++;
                    this._urlLoadResolvers.set(id, resolve);
                    window.parent.postMessage(`getUrl:${JSON.stringify({ id, url })}`, '*');
                });
            }
            else {
                return this._realLoadResource(url);
            }
        });
    }
}
const devToolsFrame = document.getElementById('devtools');
devToolsFrame.onload = () => {
    const dtWindow = devToolsFrame.contentWindow;
    // Override the apis and websocket so that we can control them
    dtWindow.InspectorFrontendHost = new ToolsHost();
    dtWindow.WebSocket = ToolsWebSocket;
    dtWindow.ResourceLoaderOverride = new ToolsResourceLoader(dtWindow);
    // Prevent the devtools from using localStorage since it doesn't exist in data uris
    Object.defineProperty(dtWindow, 'localStorage', {
        get: function () { return undefined; },
        set: function () { }
    });
    // Add unhandled exception listeners for telemetry
    const reportError = function (name, stack) {
        const telemetry = {
            name: `devtools/${name}`,
            properties: { stack: stack.substr(0, 30) },
            metrics: {}
        };
        dtWindow.parent.postMessage(`telemetry:${JSON.stringify(telemetry)}`, '*');
    };
    dtWindow.addEventListener('error', (event) => {
        const stack = (event && event.error && event.error.stack ? event.error.stack : event.message);
        reportError('error', stack);
    });
    dtWindow.addEventListener('unhandledrejection', (reject) => {
        const stack = (reject && reject.reason && reject.reason.stack ? reject.reason.stack : reject.type);
        reportError('unhandledrejection', stack);
    });
};
// Listen for preferences from the extension
window.addEventListener('message', (e) => {
    if (e.data.substr(0, 12) === 'preferences:') {
        devToolsFrame.contentWindow.InspectorFrontendHost.fireGetStateCallback(e.data.substr(12));
    }
    else if (e.data.substr(0, 7) === 'setUrl:') {
        devToolsFrame.contentWindow.ResourceLoaderOverride.resolveUrlRequest(e.data.substr(7));
    }
});
//# sourceMappingURL=storage.js.map