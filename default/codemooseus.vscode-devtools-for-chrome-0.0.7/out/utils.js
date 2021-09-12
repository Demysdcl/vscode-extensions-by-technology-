"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cp = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const net = __importStar(require("net"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const url = __importStar(require("url"));
function getURL(aUrl, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(aUrl);
        const get = parsedUrl.protocol === 'https:' ? https.get : http.get;
        options = Object.assign(Object.assign({ rejectUnauthorized: false }, parsedUrl), options);
        get(options, (response) => {
            let responseData = '';
            response.on('data', chunk => {
                responseData += chunk.toString();
            });
            response.on('end', () => {
                // Sometimes the 'error' event is not fired. Double check here.
                if (response.statusCode === 200) {
                    resolve(responseData);
                }
                else {
                    reject(new Error(responseData.trim()));
                }
            });
        }).on('error', e => {
            reject(e);
        });
    });
}
exports.getURL = getURL;
function fixRemoteUrl(remoteAddress, remotePort, target) {
    if (target.webSocketDebuggerUrl) {
        const addressMatch = target.webSocketDebuggerUrl.match(/ws:\/\/([^/]+)\/?/);
        if (addressMatch) {
            const replaceAddress = `${remoteAddress}:${remotePort}`;
            target.webSocketDebuggerUrl = target.webSocketDebuggerUrl.replace(addressMatch[1], replaceAddress);
        }
    }
    return target;
}
exports.fixRemoteUrl = fixRemoteUrl;
function getPlatform() {
    const platform = os.platform();
    return platform === 'darwin' ? 1 /* OSX */ :
        platform === 'win32' ? 0 /* Windows */ :
            2 /* Linux */;
}
exports.getPlatform = getPlatform;
function existsSync(path) {
    try {
        fs.statSync(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.existsSync = existsSync;
function launchLocalChrome(chromePath, chromePort, targetUrl) {
    const chromeArgs = [
        '--disable-extensions',
        `--remote-debugging-port=${chromePort}`
    ];
    const chromeProc = cp.spawn(chromePath, chromeArgs, {
        stdio: 'ignore',
        detached: true
    });
    chromeProc.unref();
}
exports.launchLocalChrome = launchLocalChrome;
function isPortFree(host, port) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            const server = net.createServer();
            server.on('error', () => resolve(false));
            server.listen(port, host);
            server.on('listening', () => {
                server.close();
                server.unref();
            });
            server.on('close', () => resolve(true));
        });
    });
}
exports.isPortFree = isPortFree;
const WIN_APPDATA = process.env.LOCALAPPDATA || '/';
const DEFAULT_CHROME_PATH = {
    LINUX: '/usr/bin/google-chrome',
    OSX: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    WIN: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    WIN_LOCALAPPDATA: path.join(WIN_APPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    WINx86: 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
};
function getPathToChrome() {
    const platform = getPlatform();
    if (platform === 1 /* OSX */) {
        return existsSync(DEFAULT_CHROME_PATH.OSX) ? DEFAULT_CHROME_PATH.OSX : '';
    }
    else if (platform === 0 /* Windows */) {
        if (existsSync(DEFAULT_CHROME_PATH.WINx86)) {
            return DEFAULT_CHROME_PATH.WINx86;
        }
        else if (existsSync(DEFAULT_CHROME_PATH.WIN)) {
            return DEFAULT_CHROME_PATH.WIN;
        }
        else if (existsSync(DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA)) {
            return DEFAULT_CHROME_PATH.WIN_LOCALAPPDATA;
        }
        else {
            return '';
        }
    }
    else {
        return existsSync(DEFAULT_CHROME_PATH.LINUX) ? DEFAULT_CHROME_PATH.LINUX : '';
    }
}
exports.getPathToChrome = getPathToChrome;
function pathToFileURL(absPath, normalize) {
    if (normalize) {
        absPath = path.normalize(absPath);
        absPath = forceForwardSlashes(absPath);
    }
    absPath = (absPath.startsWith('/') ? 'file://' : 'file:///') + absPath;
    return encodeURI(absPath);
}
exports.pathToFileURL = pathToFileURL;
function forceForwardSlashes(aUrl) {
    return aUrl
        .replace(/\\\//g, '/') // Replace \/ (unnecessarily escaped forward slash)
        .replace(/\\/g, '/');
}
exports.forceForwardSlashes = forceForwardSlashes;
function getUrlFromConfig(folder, config) {
    let outUrlString = '';
    if (config.file) {
        outUrlString = config.file;
        outUrlString = outUrlString.replace('${workspaceFolder}', folder.uri.path);
        outUrlString = pathToFileURL(outUrlString);
    }
    else if (config.url) {
        outUrlString = config.url;
    }
    return outUrlString;
}
exports.getUrlFromConfig = getUrlFromConfig;
//# sourceMappingURL=utils.js.map