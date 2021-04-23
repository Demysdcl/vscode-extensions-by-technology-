"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.
Object.defineProperty(exports, "__esModule", { value: true });
var AppState;
(function (AppState) {
    AppState["INACTIVE"] = "inactive";
    AppState["RUNNING"] = "running";
    AppState["LAUNCHING"] = "launching"; // TODO: Distinguish launching & running via JMX.
})(AppState = exports.AppState || (exports.AppState = {}));
class BootApp {
    constructor(_path, _name, _classpath, _state) {
        this._path = _path;
        this._name = _name;
        this._classpath = _classpath;
        this._state = _state;
    }
    get activeSessionName() {
        return this._activeSessionName;
    }
    set activeSessionName(session) {
        this._activeSessionName = session;
    }
    get path() {
        return this._path;
    }
    get name() {
        return this._name;
    }
    set name(name) {
        this._name = name;
    }
    set jmxPort(port) {
        this._jmxPort = port;
    }
    get jmxPort() {
        return this._jmxPort;
    }
    get classpath() {
        return this._classpath;
    }
    set classpath(classpath) {
        this._classpath = classpath;
    }
    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
    }
}
exports.BootApp = BootApp;
//# sourceMappingURL=BootApp.js.map