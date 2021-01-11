'use strict';
var vscode = require('vscode');
var ktlint_1 = require('ktlint');
var childProcess = require('child_process');
var exec = childProcess.exec;
function runCommand(command) {
    exec(command, function (err, stdout, stderr) {
        // the *entire* stdout and stderr (buffered)
        console.log(stdout);
        console.log(stderr);
        if (err) {
            console.log('Could not execute the command');
            console.log(err);
            // node couldn't execute the command
            return;
        }
    });
}
function showProgress(promise) {
    var progressLocation = vscode.ProgressLocation.Notification;
    vscode.window.withProgress({
        location: progressLocation,
        title: 'Formatting…',
        cancellable: false
    }, function (progress, token) {
        return promise;
    });
}
function activate(context) {
    var supportedDocuments = [{ language: 'kotlin' }];
    // 👍 formatter implemented using API
    var formatter = vscode.languages.registerDocumentFormattingEditProvider(supportedDocuments, {
        provideDocumentFormattingEdits: function (document) {
            var p = new Promise(function (resolve) {
                ktlint_1.ktlint("-F " + document.uri.path);
                resolve();
            });
            showProgress(p);
            var firstLine = document.lineAt(0);
            return [];
        }
    });
    context.subscriptions.push(formatter);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map