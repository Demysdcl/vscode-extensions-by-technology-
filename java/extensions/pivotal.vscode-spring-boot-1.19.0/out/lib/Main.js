'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const VSCode = require("vscode");
const vscode_1 = require("vscode");
const commons = require("@pivotal-tools/commons-vscode");
const liveHoverUi = require("./live-hover-connect-ui");
const PROPERTIES_LANGUAGE_ID = "spring-boot-properties";
const YAML_LANGUAGE_ID = "spring-boot-properties-yaml";
const JAVA_LANGUAGE_ID = "java";
const XML_LANGUAGE_ID = "xml";
const NEVER_SHOW_AGAIN = "Do not show again";
/** Called when extension is activated */
function activate(context) {
    // registerPipelineGenerator(context);
    let options = {
        DEBUG: false,
        CONNECT_TO_LS: false,
        extensionId: 'vscode-spring-boot',
        preferJdk: true,
        checkjvm: (context, jvm) => {
            if (!jvm.isJdk()) {
                VSCode.window.showWarningMessage('JAVA_HOME or PATH environment variable seems to point to a JRE. A JDK is required, hence Boot Hints are unavailable.', NEVER_SHOW_AGAIN).then(selection => {
                    if (selection === NEVER_SHOW_AGAIN) {
                        options.workspaceOptions.update('checkJVM', false);
                    }
                });
            }
        },
        explodedLsJarData: {
            lsLocation: 'language-server',
            mainClass: 'org.springframework.ide.vscode.boot.app.BootLanguagServerBootApp',
            configFileName: 'application.properties'
        },
        workspaceOptions: VSCode.workspace.getConfiguration("spring-boot.ls"),
        clientOptions: {
            // See PT-158992999 as to why a scheme is added to the document selector
            // documentSelector: [ PROPERTIES_LANGUAGE_ID, YAML_LANGUAGE_ID, JAVA_LANGUAGE_ID ],
            documentSelector: [
                {
                    language: PROPERTIES_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: YAML_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: JAVA_LANGUAGE_ID,
                    scheme: 'file'
                },
                {
                    language: JAVA_LANGUAGE_ID,
                    scheme: 'jdt'
                },
                {
                    language: XML_LANGUAGE_ID,
                    scheme: 'file'
                }
            ],
            synchronize: {
                configurationSection: 'boot-java'
            },
            initializationOptions: {
                workspaceFolders: vscode_1.workspace.workspaceFolders ? vscode_1.workspace.workspaceFolders.map(f => f.uri.toString()) : null
            }
        },
        highlightCodeLensSettingKey: 'boot-java.highlight-codelens.on'
    };
    return commons.activate(options, context).then(client => {
        liveHoverUi.activate(client, options, context);
        return client;
    });
}
exports.activate = activate;
//# sourceMappingURL=Main.js.map