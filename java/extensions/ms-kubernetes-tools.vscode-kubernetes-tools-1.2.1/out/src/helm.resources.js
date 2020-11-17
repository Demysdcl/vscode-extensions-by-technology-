"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const v1 = require("./v1");
const _ = require("lodash");
const fs = require("./wsl-fs");
const filepath = require("path");
const shell_1 = require("./shell");
// Resources describes Kubernetes resource keywords.
class Resources {
    all() {
        const home = shell_1.shell.home();
        const schemaDir = filepath.join(home, ".kube/schema");
        if (!fs.existsSync(schemaDir)) {
            // Return the default set.
            return this.v1();
        }
        const stat = fs.statSync(schemaDir);
        if (!stat.isDirectory()) {
            // Return the default set.
            return this.v1();
        }
        // Otherwise, try to dynamically build completion items from the
        // entire schema.
        const schemaDirContents = shell_1.shell.ls(schemaDir);
        if (schemaDirContents.length === 0) {
            // Return the default set.
            return this.v1();
        }
        const kversion = _.last(schemaDirContents);
        console.log("Loading schema for version " + kversion);
        // Inside of the schemaDir, there are some top-level copies of the schemata.
        // Instead of walking the tree, we just parse those.  Note that kubectl loads
        // schemata on demand, which means we won't have an exhaustive list, but we are
        // more likely to get the ones that this user is actually using, including
        // TPRs.
        let res = Array.of();
        const path = filepath.join(schemaDir, kversion);
        shell_1.shell.ls(path).forEach((item) => {
            const itemPath = filepath.join(path, item);
            const stat = fs.statSync(itemPath);
            if (stat.isDirectory()) {
                return;
            }
            const schema = JSON.parse(shell_1.shell.cat(itemPath));
            if (!schema.models) {
                return;
            }
            console.log("Adding schema " + itemPath);
            res = res.concat(this.fromSchema(schema.models));
        });
        console.log(`Attached ${res.length} resource kinds`);
        return res;
    }
    v1() {
        return this.fromSchema(v1.default.models);
    }
    // Extract hover documentation from a Swagger model.
    fromSchema(schema) {
        const res = Array.of();
        _.each(schema, (v, k) => {
            const i = k.lastIndexOf(".");
            const kind = k.substr(i + 1);
            res.push(val(kind, `kind: ${kind}`, v.description));
            _.each(v.properties, (spec, label) => {
                let type = "undefined";
                switch (spec.type) {
                    case undefined:
                        // This usually means there's a $ref instead of a type
                        if (spec["$ref"]) {
                            type = spec["$ref"];
                        }
                        break;
                    case "array":
                        // Try to give a pretty type.
                        if (spec.items.type) {
                            type = spec.items.type + "[]";
                            break;
                        }
                        else if (spec.items["$ref"]) {
                            type = spec.items["$ref"] + "[]";
                            break;
                        }
                        type = "[]";
                        break;
                    default:
                        if (spec.type) {
                            type = spec.type;
                        }
                        break;
                }
                res.push(d(label, `${label}: ${type}`, spec.description));
            });
        });
        return res;
    }
}
exports.Resources = Resources;
function d(name, use, doc) {
    const i = new vscode.CompletionItem(name, vscode.CompletionItemKind.Variable);
    i.detail = use;
    i.documentation = doc;
    return i;
}
function val(name, use, doc) {
    const i = new vscode.CompletionItem(name, vscode.CompletionItemKind.Value);
    i.detail = use;
    i.documentation = doc;
    return i;
}
//# sourceMappingURL=helm.resources.js.map