/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/host/mainHost.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/host/host.ts":
/*!**************************!*\
  !*** ./src/host/host.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const toolsHost_1 = __webpack_require__(/*! ./toolsHost */ "./src/host/toolsHost.ts");
function initialize(dtWindow) {
    if (!dtWindow) {
        return;
    }
    // Create a mock sessionStorage since it doesn't exist in data url but the devtools use it
    const sessionStorage = {};
    Object.defineProperty(dtWindow, "sessionStorage", {
        get() { return sessionStorage; },
        set() { },
    });
    // Prevent the devtools from using localStorage since it doesn't exist in data uris
    Object.defineProperty(dtWindow, "localStorage", {
        get() { return undefined; },
        set() { },
    });
    // Setup the global objects that must exist at load time
    dtWindow.InspectorFrontendHost = new toolsHost_1.ToolsHost();
    dtWindow.WebSocket = toolsHost_1.ToolsWebSocket;
    // Listen for messages from the extension and forward to the tools
    dtWindow.addEventListener("message", (e) => {
        if (e.data.substr(0, 12) === 'preferences:') {
            dtWindow.InspectorFrontendHost.fireGetStateCallback(e.data.substr(12));
        }
        else if (e.data.substr(0, 7) === 'setUrl:') {
            dtWindow.ResourceLoaderOverride.resolveUrlRequest(e.data.substr(7));
        }
    }, true);
    dtWindow.addEventListener("DOMContentLoaded", () => {
        dtWindow.ResourceLoaderOverride = new toolsHost_1.ToolsResourceLoader(dtWindow);
        dtWindow._importScriptPathPrefix = dtWindow._importScriptPathPrefix.replace("null", "vscode-resource:");
    });
}
exports.initialize = initialize;


/***/ }),

/***/ "./src/host/mainHost.ts":
/*!******************************!*\
  !*** ./src/host/mainHost.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const host_1 = __webpack_require__(/*! ./host */ "./src/host/host.ts");
host_1.initialize(window);


/***/ }),

/***/ "./src/host/toolsHost.ts":
/*!*******************************!*\
  !*** ./src/host/toolsHost.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class ToolsHost {
    constructor() {
        this._getStateCallback = undefined;
    }
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
    copyText(text) {
        window.parent.postMessage(`copyText:${JSON.stringify({ text })}`, '*');
    }
    fireGetStateCallback(state) {
        const prefs = JSON.parse(state);
        if (this._getStateCallback) {
            this._getStateCallback(prefs);
        }
    }
}
exports.ToolsHost = ToolsHost;
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
exports.ToolsWebSocket = ToolsWebSocket;
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
            const callback = this._urlLoadResolvers.get(response.id);
            if (callback) {
                callback(response.content);
            }
            this._urlLoadResolvers.delete(response.id);
        }
    }
    async loadResource(url) {
        if (url === 'sources/module.json') {
            // Override the paused event revealer so that hitting a bp will not switch to the sources tab
            const content = await this._realLoadResource(url);
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
    }
}
exports.ToolsResourceLoader = ToolsResourceLoader;


/***/ })

/******/ });
//# sourceMappingURL=host.bundle.js.map