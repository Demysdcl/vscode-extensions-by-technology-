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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionHasItem = exports.sectionHasItems = exports.asyncFilter = exports.waitForEvent = exports.getNotifications = exports.notificationExistsWithObject = exports.safeNotificationExists = exports.notificationExists = exports.stopAllServers = exports.deleteAllServers = exports.findNotification = exports.serverHasState = void 0;
const vscode_extension_tester_1 = require("vscode-extension-tester");
/**
 * @author Ondrej Dockal <odockal@redhat.com>
 */
function serverHasState(server, state) {
    return __awaiter(this, void 0, void 0, function* () {
        var stateActual = yield server.getServerState();
        return stateActual === state;
    });
}
exports.serverHasState = serverHasState;
function findNotification(text) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new vscode_extension_tester_1.Workbench().openNotificationsCenter();
        const notifications = yield (new vscode_extension_tester_1.NotificationsCenter()).getNotifications(vscode_extension_tester_1.NotificationType.Any);
        for (const notification of notifications) {
            if (notification) {
                const message = yield notification.getMessage();
                if (message.indexOf(text) >= 0) {
                    return notification;
                }
            }
        }
    });
}
exports.findNotification = findNotification;
function deleteAllServers(rsp) {
    return __awaiter(this, void 0, void 0, function* () {
        const servers = yield rsp.getServers();
        for (let server of servers) {
            yield server.delete();
        }
    });
}
exports.deleteAllServers = deleteAllServers;
function stopAllServers(rsp) {
    return __awaiter(this, void 0, void 0, function* () {
        const servers = yield rsp.getServers();
        for (let server of servers) {
            yield server.stop();
        }
    });
}
exports.stopAllServers = stopAllServers;
function notificationExists(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const notifications = yield getNotifications();
        for (const notification of notifications) {
            if (notification) {
                const message = yield notification.getMessage();
                if (message.indexOf(text) >= 0) {
                    return true;
                }
            }
        }
        return false;
    });
}
exports.notificationExists = notificationExists;
function safeNotificationExists(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield notificationExists(text);
        }
        catch (err) {
            if (err.name === 'StaleElementReferenceError') {
                return yield notificationExists(text);
            }
            else {
                throw err;
            }
        }
    });
}
exports.safeNotificationExists = safeNotificationExists;
function notificationExistsWithObject(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const notifications = yield getNotifications();
        for (const notification of notifications) {
            if (notification) {
                const message = yield notification.getMessage();
                if (message.indexOf(text) >= 0) {
                    return notification;
                }
            }
        }
    });
}
exports.notificationExistsWithObject = notificationExistsWithObject;
function getNotifications(type = vscode_extension_tester_1.NotificationType.Any) {
    return __awaiter(this, void 0, void 0, function* () {
        yield new vscode_extension_tester_1.Workbench().openNotificationsCenter();
        return yield (new vscode_extension_tester_1.NotificationsCenter()).getNotifications(type);
    });
}
exports.getNotifications = getNotifications;
function waitForEvent(func, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield vscode_extension_tester_1.VSBrowser.instance.driver.wait(func, timeout);
    });
}
exports.waitForEvent = waitForEvent;
exports.asyncFilter = (arr, predicate) => __awaiter(void 0, void 0, void 0, function* () {
    const results = yield Promise.all(arr.map(predicate));
    return arr.filter((_v, index) => results[index]);
});
function sectionHasItems(sideBar) {
    return __awaiter(this, void 0, void 0, function* () {
        const sections = yield sideBar.getContent().getSections();
        return (yield sections[0].getVisibleItems()).length > 0;
    });
}
exports.sectionHasItems = sectionHasItems;
function sectionHasItem(sideBar, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const section = yield sideBar.getContent().getSection(name);
        return section ? true : false;
    });
}
exports.sectionHasItem = sectionHasItem;
//# sourceMappingURL=serverUtils.js.map