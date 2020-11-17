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
exports.JobProgress = void 0;
/*-----------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat, Inc. All rights reserved.
 *  Licensed under the EPL v2.0 License. See LICENSE file in the project root for license information.
 *-----------------------------------------------------------------------------------------------*/
const rsp_client_1 = require("rsp-client");
const vscode = require("vscode");
class JobProgress {
    constructor(job, client, progress, cancellation, reject, resolve) {
        this.percents = 0;
        this.job = job;
        this.client = client;
        this.progress = progress;
        this.cancellation = cancellation;
        this.reject = reject;
        this.resolve = resolve;
        this.initListeners();
        this.setTimeout();
        progress.report({ message: `${job.name} started...`, increment: 0 });
    }
    static create(client) {
        client.getIncomingHandler().onJobAdded((jobHandle) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Job ${jobHandle.name} started`,
                cancellable: true
            }, (progress, token) => {
                return new Promise((resolve, reject) => {
                    new JobProgress(jobHandle, client, progress, token, reject, resolve);
                })
                    .catch(error => {
                    if (error) {
                        vscode.window.showErrorMessage(error);
                    }
                    return Promise.reject(error);
                });
            });
        });
    }
    initListeners() {
        this.cancellation.onCancellationRequested(() => { this.onCancel(); });
        this.client.getIncomingHandler().onJobRemoved((jobRemoved) => {
            this.onJobRemoved(jobRemoved);
        });
        this.client.getIncomingHandler().onJobChanged((jobProgress) => {
            this.onJobProgress(jobProgress);
        });
    }
    onJobProgress(jobProgress) {
        if (!this.isJob(jobProgress.handle)) {
            return;
        }
        this.progress.report({ message: `${jobProgress.percent}%`, increment: jobProgress.percent - this.percents });
        this.percents = jobProgress.percent;
        console.log(`Job ${jobProgress.handle.name} completion is at ${jobProgress.percent}`);
        this.restartTimeout();
    }
    onJobRemoved(jobRemoved) {
        if (!this.isJob(jobRemoved.handle)) {
            return;
        }
        this.clearTimeout();
        if (!rsp_client_1.StatusSeverity.isOk(jobRemoved.status)) {
            this.reject(this.getErrorMessage(jobRemoved.status));
        }
        else {
            this.resolve(this.job);
        }
    }
    getErrorMessage(status) {
        let message = '';
        if (status) {
            message = status.message;
            if (status.trace) {
                const match = /Caused by:([^\n]+)/gm.exec(status.trace);
                if (match && match.length && match.length > 1) {
                    message += ':' + match[1];
                }
            }
        }
        return message;
    }
    onCancel() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.getOutgoingHandler().cancelJob(this.job);
            if (this.timeoutId) {
                this.clearTimeout();
            }
            this.reject();
        });
    }
    isJob(job) {
        return job && this.job.id === job.id;
    }
    restartTimeout() {
        this.clearTimeout();
        this.setTimeout();
    }
    setTimeout() {
        this.timeoutId = setTimeout(() => {
            console.log(`Job ${this.job.name} timed out at ${this.percents}`);
            this.reject(`${this.job.name} timed out.`);
        }, JobProgress.JOB_TIMEOUT);
    }
    clearTimeout() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
}
exports.JobProgress = JobProgress;
JobProgress.JOB_TIMEOUT = 1000 * 60 * 10; // 10 minutes
//# sourceMappingURL=jobprogress.js.map