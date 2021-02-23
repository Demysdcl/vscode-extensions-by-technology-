"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vsls = require("vsls/vscode");
const tree_provider_1 = require("./tree-provider");
const vscode = require("vscode");
const SERVICE_NAME = 'browser-preview';
const REQUEST_GET_WINDOWS = 'getWindows';
const NOTIFICATION_WINDOW_CREATED = 'windowCreated';
const NOTIFICATION_WINDOW_DISPOSED = 'windowDisposed';
const NOTIFICATION_WINDOW_INTERACTION = 'windowInteraction';
const NOTIFICATION_WINDOW_RESIZED = 'windowResized';
const DISPATCHED_EVENTS = [
    'Input.dispatchKeyEvent',
    'Input.dispatchMouseEvent',
    'Page.goBackward',
    'Page.goForward',
    'Page.navigate',
    'Page.reload'
];
function log(message, ...params) {
    console.log(`Browser Preview (Live Share): ${message}`, ...params);
}
async function setupLiveShare(extensionPath, windowManager) {
    const liveShare = await vsls.getApi();
    if (!liveShare) {
        log('Extension not installed, so skipping initialization');
        return;
    }
    await sessionStarted(liveShare);
    tree_provider_1.default(extensionPath, liveShare, windowManager);
    vscode.commands.registerCommand('browser-preview.openSharedBrowser', (id) => {
        const window = windowManager.getById(id);
        if (window) {
            window.show();
        }
    });
    setupServices(liveShare, windowManager);
}
exports.setupLiveShare = setupLiveShare;
async function setupServices(liveShare, windowManager) {
    var service;
    if (liveShare.session.role === vsls.Role.Host) {
        log('Initializing host service');
        service = (await liveShare.shareService(SERVICE_NAME));
        windowManager.openWindows.forEach((window) => handleWindowResizing(window, service));
        windowManager.on(NOTIFICATION_WINDOW_DISPOSED, (id) => {
            log('Notifying guests of window disposal', id);
            service.notify(NOTIFICATION_WINDOW_DISPOSED, { id });
        });
        service.onRequest(REQUEST_GET_WINDOWS, () => {
            const windows = Array.from(windowManager.openWindows);
            const windowStates = windows.map((window) => ({ ...window.getState(), id: window.id }));
            console.log('Returning browser windows to guest', windowStates);
            return windowStates;
        });
    }
    else if (liveShare.session.role === vsls.Role.Guest) {
        log('Initializing guest service');
        service = (await liveShare.getSharedService(SERVICE_NAME));
        if (!service) {
            log("Host doesn't have the Browser Preview extension installed, skipping initialization");
            return;
        }
        const windows = await service.request(REQUEST_GET_WINDOWS, []);
        log('Requested windows', windows);
        if (windows && windows.length > 0) {
            windows.forEach(async (state) => {
                log('Creating window', state);
                const window = await windowManager.create(state.url, state.id);
                window.setViewport(state.viewportMetadata);
            });
        }
        service.onNotify(NOTIFICATION_WINDOW_CREATED, async (args) => {
            log('Window created', args);
            const window = await windowManager.create(args.url, args.id);
            window.setViewport(args.viewportMetadata);
        });
        service.onNotify(NOTIFICATION_WINDOW_DISPOSED, async (args) => {
            log('Window disposed', args);
            const window = windowManager.getById(args.id);
            window.dispose();
        });
        service.onNotify(NOTIFICATION_WINDOW_RESIZED, async (args) => {
            log('Window resized', args);
            const window = windowManager.getById(args.id);
            window.setViewport(args.viewportMetadata);
        });
    }
    handleRemoteInteractions(service, liveShare, windowManager);
    handleLocalWindowCreation(service, liveShare, windowManager);
}
function sessionStarted(liveShare) {
    return new Promise((resolve) => {
        if (liveShare.session.id) {
            resolve();
        }
        else {
            liveShare.onDidChangeSession((e) => {
                if (e.session.id) {
                    resolve();
                }
            });
        }
    });
}
function handleRemoteInteractions(service, liveShare, windowManager) {
    log('Setting up remote listeners');
    service.onNotify(NOTIFICATION_WINDOW_INTERACTION, async (args) => {
        const { peerNumber, id, data } = args;
        if (peerNumber === liveShare.session.peerNumber) {
            // This is a re-broadcasted event from
            // the same user.
            return;
        }
        const window = windowManager.getById(id);
        log('Received client event', data, window);
        window.browserPage.send(data.type, data.params);
        if (liveShare.session.role === vsls.Role.Host) {
            service.notify(NOTIFICATION_WINDOW_INTERACTION, args);
        }
    });
}
function handleLocalWindowCreation(service, liveShare, windowManager) {
    log('Setting up local listeners');
    windowManager.on(NOTIFICATION_WINDOW_CREATED, async (id) => {
        const window = windowManager.getById(id);
        log('Window created', window);
        if (liveShare.session.role === vsls.Role.Host) {
            const intervalId = setInterval(function () {
                const state = window.getState();
                if (state.viewportMetadata &&
                    state.url !== 'about:blank' &&
                    typeof state.viewportMetadata.height === 'number') {
                    clearInterval(intervalId);
                    log('Notifying guests of window', state);
                    service.notify(NOTIFICATION_WINDOW_CREATED, { ...state, id: id });
                    handleWindowResizing(window, service);
                }
            }, 100);
        }
        // Listen for any local browser interactions,
        // and synronize them to all other guests.
        window.onAny((type, ...params) => {
            if (!DISPATCHED_EVENTS.includes(type.toString())) {
                return;
            }
            log('Sending client event', type, params);
            service.notify(NOTIFICATION_WINDOW_INTERACTION, {
                peerNumber: liveShare.session.peerNumber,
                data: { params: params[0], type },
                id: window.id
            });
        });
    });
}
function handleWindowResizing(window, service) {
    const state = window.getState();
    let currentDimensions = { height: state.viewportMetadata.height, width: state.viewportMetadata.width };
    window.on('stateChanged', () => {
        const { viewportMetadata } = window.getState();
        if (viewportMetadata.height !== currentDimensions.height || viewportMetadata.width !== currentDimensions.width) {
            currentDimensions = { height: viewportMetadata.height, width: viewportMetadata.width };
            log('Notifying guests of window resize');
            service.notify(NOTIFICATION_WINDOW_RESIZED, { id: window.id, viewportMetadata });
        }
    });
}
//# sourceMappingURL=index.js.map