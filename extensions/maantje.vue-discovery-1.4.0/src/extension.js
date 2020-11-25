const vscode = require('vscode');
const _ = require('lodash');
const {
    CompletionItemKind,
    CompletionItem,
    SnippetString,
    window,
    workspace,
    Position,
    languages,
    commands,
} = vscode;

const glob = require('glob');
const fs = require('fs');
const path = require('path');
const Parser  = require('./parser');
const configOverride = {};
let jsFiles = [];

function getFilesByExtension(extension) {
    return new Promise((resolve, reject) => {
        glob(`${getRootPath()}${config('rootDirectory')}/**/*.${extension}`, (err, res) => {
            if (err) {
                return reject(err);
            }

            resolve(res);
        });
    });
}

function getVueFiles() {
    return getFilesByExtension('vue');
}

function getJsFiles() {
    return getFilesByExtension('js');
}

/**
 * Retrieve the component name from a path
 * eg src/components/Table.vue returns Table
 * @param {String} file
 */
function retrieveComponentNameFromFile(file) {
    const parts = file.split('/');

    return parts[parts.length - 1].split('.')[0];
}

/**
 * Retrieve the component name with directory
 * eg src/components/Table.vue returns components/Table.vue
 * @param {String} file
 */
function retrieveWithDirectoryInformationFromFile(file) {
    const parts = file.split('/');

    return parts.slice(parts.length - 2, parts.length).join('/');
}

/**
 * Creates a completion item for a components from a path
 * @param {String} file
 */
function createComponentCompletionItem(file) {
    const fileName = retrieveComponentNameFromFile(file);
    const snippetCompletion = new CompletionItem(fileName, CompletionItemKind.Constructor);

    snippetCompletion.detail = retrieveWithDirectoryInformationFromFile(file);
    snippetCompletion.command = { title: 'Import file', command: 'vueDiscovery.importFile', arguments: [file, fileName] };

    // We don't want to insert anything here since this will be done in the importFile command
    snippetCompletion.insertText = '';

    return snippetCompletion;
}

function createPropCompletionItem(prop) {
    const snippetCompletion = new CompletionItem(prop, CompletionItemKind.Variable);

    snippetCompletion.insertText = new SnippetString(`${prop}="$0"`);

    return snippetCompletion;
}

function createEventCompletionItem(event) {
    const snippetCompletion = new CompletionItem(event, CompletionItemKind.Event);

    snippetCompletion.insertText = new SnippetString(`${_.kebabCase(event)}="$0"`);

    return snippetCompletion;
}

function hasScriptTagInactiveTextEditor() {
    const text = window.activeTextEditor.document.getText();
    const scriptTagMatch = /<script/.exec(text);

    return scriptTagMatch && scriptTagMatch.index > -1;
}

function config(key) {
    if (key in configOverride) {
        return configOverride[key];
    }

    return workspace
        .getConfiguration()
        .get(`vueDiscovery.${key}`);
}

/**
 * Retrieves the props from a fire
 * @param {String} file
 */
function retrievePropsFrom(file) {
    const content = fs.readFileSync(file,'utf8');
    const { mixins, props } = new Parser(content).parse();

    let mixinProps = {};

    if (mixins) {
        mixinProps = mixins.reduce((accumulator, mixin) => {
            const file = jsFiles.find(file => file.includes(mixin));

            if (!file) {
                return accumulator;
            }

            return { ...accumulator, ...retrievePropsFrom(file) };
        }, {});
    }

    return { ...mixinProps,...props };
}

/**
 * Retrieves the events from a fire
 * @param {String} file
 */
function retrieveEventsFrom(file) {
    const content = fs.readFileSync(file,'utf8');
    const { mixins, events } = new Parser(content).parse();

    let mixinEvents = [];

    if (mixins) {
        mixinEvents = mixins.reduce((accumulator, mixin) => {
            const file = jsFiles.find(file => file.includes(mixin));

            if (!file) {
                return accumulator;
            }

            return [...accumulator, ...retrieveEventsFrom(file)];
        }, []);
    }

    return [...mixinEvents,...events];
}

/**
 * Retrieves the required props from a fire
 * @param {String} file
 */
function retrieveRequirePropsFromFile(file) {
    const props = retrievePropsFrom(file);

    if (!props) {
        return;
    }

    return Object.keys(props).filter(prop => {
        return props[prop].required;
    });
}

/**
 * Inserts the snippet for the component in the template section
 * @param {String} file
 * @param {String} fileName
 */
function insertSnippet(file, fileName) {
    const requiredProps = retrieveRequirePropsFromFile(file);

    let tabStop = 1;

    const requiredPropsSnippetString = requiredProps.reduce((accumulator, prop) => {
        return accumulator += ` :$${tabStop++}${propCase(prop)}="$${tabStop++}"`;
    }, '');

    fileName = caseFileName(fileName);

    const snippetString = `<${fileName}${requiredPropsSnippetString}>$0</${fileName}>`;

    getEditor().insertSnippet(new SnippetString(snippetString));
}

function propCase(prop) {
    const casing = config('propCase');

    if (casing === 'kebab') {
        return _.kebabCase(prop);
    }

    return _.camelCase(prop);
}

function caseFileName(fileName) {
    const casing = config('componentCase');

    if (casing === 'kebab') {
        return _.kebabCase(fileName);
    }

    return _.upperFirst(_.camelCase(fileName));
}

function getEditor() {
    return window.activeTextEditor;
}

function getDocument() {
    return getEditor().document;
}

function getDocumentText() {
    return getDocument().getText();
}

function getAlias(fileWithoutRootPath) {
    const aliases = findAliases();
    const aliasKey = Object.keys(aliases).find(alias => fileWithoutRootPath.startsWith(aliases[alias][0].replace('*', '')));

    let alias = null;

    if (aliasKey) {
        alias = { value: aliasKey.replace('*', ''), path: aliases[aliasKey][0].replace('*', '') };
    }

    return alias;
}

function getRelativePath(fileWithoutRootPath) {
    const openFileWithoutRootPath = getDocument().uri.fsPath.replace(getRootPath() + '/', '');

    const importPath = path.relative(path.dirname(openFileWithoutRootPath), path.dirname(fileWithoutRootPath));

    if (importPath === '') {
        return '.';
    }

    if (importPath.startsWith('..')) {
        return importPath;
    }

    return `./${importPath}`;
}

function getImportPath(file, fileName) {
    const fileWithoutRootPath = file.replace(getRootPath() + '/', '');
    const alias = getAlias(fileWithoutRootPath);

    if (alias) {
        return fileWithoutRootPath.replace(`${alias.path}`, alias.value);
    }

    return `${getRelativePath(fileWithoutRootPath)}/${fileName}.vue`;
}

/**
 * Inserts the import in the scripts section
 * @param {String} file
 * @param {String} fileName
 */
async function insertImport(file, fileName) {
    const document = getDocument();
    const text = getDocumentText();
    const match = /<script/.exec(text);
    const importPath = getImportPath(file, fileName);

    if (text.indexOf(`import ${fileName} from '${importPath}`) === -1) {
        const scriptTagPosition = document.positionAt(match.index);
        const insertPosition = new Position(scriptTagPosition.line + 1, 0);
        await getEditor().edit(edit => {
            edit.insert(insertPosition, `import ${fileName} from '${importPath}'\n`);
        });
    }
}

function getIndentBase() {
    const editor = getEditor();

    return editor.options.insertSpaces
        ? ' '.repeat(editor.options.tabSize)
        : '\t';
}

function getIndent() {
    return getIndentBase().repeat(2);
}

/**
 * Inserts the component in a new components section
 * @param {String} text
 * @param {String} componentName
 */
async function insertComponents(text, componentName) {
    const match = /export[\s]*default[\s]*\{/.exec(text);

    if (!match || match.index === -1) {
        return;
    }

    const insertIndex = match.index + match[0].length;
    const propIndent = getIndentBase().repeat(1);
    const component = `\n${propIndent}components: {\n${getIndent()}${componentName}\n${propIndent}},`;

    await getEditor().edit(edit => {
        edit.insert(getDocument().positionAt(insertIndex), component);
    });
}

function componentCase(componentName) {
    if (config('componentCase') === 'kebab') {
        return `'${_.kebabCase(componentName)}': ${componentName}`;
    }

    return componentName;
}
/**
 * Inserts the component in an existing components section
 * @param {Object} match
 * @param {String} componentName
 */
async function insertInExistingComponents(match, componentName) {
    let matchInsertIndex = match[0].length;
    let found = false;

    while (!found) {
        matchInsertIndex--;

        if (/[\S]/.test(match[0].charAt(matchInsertIndex))) {
            found = true;
        }
    }

    let lastCharacter = match[0].charAt(matchInsertIndex);
    const insertIndex = match.index + matchInsertIndex + 1;

    if (lastCharacter === ',') {
        lastCharacter = '';
    } else {
        lastCharacter = ',';
    }

    const component = `${lastCharacter}\n${getIndent()}${componentName}`;

    await getEditor().edit(edit => {
        edit.insert(getDocument().positionAt(insertIndex), component);
    });
}
function addTrailingComma(component) {
    if (!config('addTrailingComma')) {
        return component;
    }

    return component + ',';
}
/**
 * Checks whether to create a new components section or append to an existing one and appends it
 * @param {String} componentName
 */
async function insertComponent(componentName) {
    componentName = addTrailingComma(componentCase(componentName));
    const text = getDocumentText();

    // Component already registered
    if (text.indexOf(`\n${getIndent()}${componentName}`) !== -1) {
        return;
    }

    const match = /components( )*:( )*{[\s\S]*?(?=})/.exec(text);

    // Components not yet defined add section with component
    if (!match || match.index === -1) {
        return insertComponents(text, componentName);
    }

    // Add the component to components
    insertInExistingComponents(match, componentName);
}

function lineAt(line) {
    const { text } = getDocument().lineAt(line);
    return text;
}

function isPositionInBetweenTag(selector, position) {
    const document = getDocument();
    const text = getDocumentText();
    const start = text.indexOf(`<${selector}>`);
    const end = text.indexOf(`</${selector}>`);

    if (start === -1 || end === -1) {
        return false;
    }

    const startLine = document.positionAt(start).line;
    const endLine = document.positionAt(end).line;

    return position.line > startLine && position.line < endLine;
}

function isCursorInBetweenTag(selector) {
    return isPositionInBetweenTag(selector, getEditor().selection.active);
}

function getActiveEditorPosition() {
    const editor = window.activeTextEditor;

    return editor.selection.active;
}

function isCursorInTemplateSection() {
    return isCursorInBetweenTag('template');
}

function findAliases() {
    try {
        const { compilerOptions } = require(getRootPath() + '/jsconfig.json');

        return compilerOptions.paths;
    } catch (e) {
        return [];
    }
}

function getRootPath() {
    return workspace.rootPath;
}

function matchTagName(markup) {
    const pattern = /<([^\s></]+)/;
    const match = markup.match(pattern);

    if (match) {
        return match[1];
    }

    return false;
}

function getComponentNameForLine(line, character = null) {
    let component = false;
    let lineToCheck = line;

    do {
        let lineContent = lineAt(lineToCheck);

        if (lineToCheck === line && character) {
            lineContent = lineContent.substring(0, character);
        }

        component = matchTagName(lineContent);

        if (lineContent.includes('>') && lineContent.includes('<') && line !== lineToCheck) {
            return false;
        }

        if ((lineContent.includes('>') || lineContent.includes('</')) && component === false) {
            return false;
        }

        lineToCheck--;
    } while (component === false);

    return _.upperFirst(_.camelCase(component.toString()));
}
async function getEventsForLine(line, character = null) {
    const component = getComponentNameForLine(line, character);

    if (!component) {
        return;
    }

    const files = await getVueFiles();

    const file = files.find(file => file.includes(component));

    if (!file) {
        return;
    }

    return retrieveEventsFrom(file);
}
async function getPropsForLine(line, character = null) {
    const component = getComponentNameForLine(line, character);

    if (!component) {
        return;
    }

    const files = await getVueFiles();

    const file = files.find(file => file.includes(component));

    if (!file) {
        return;
    }

    return retrievePropsFrom(file);
}


function getComponentAtCursor() {
    const position = getActiveEditorPosition();

    if (!position) {
        return false;
    }

    return getComponentNameForLine(position.line);
}
function isCursorInsideComponent() {
    return getComponentAtCursor() !== false;
}

function hoverContentFromProps(props) {
    return Object.keys(props).map(propName => {
        const { required, type } = props[propName];

        let requiredText = '';
        let typeText = '';

        if (required) {
            requiredText = '(required) ';
        }

        if (type) {
            typeText = `: ${type.name}`;
        }

        return `${requiredText}${propName}${typeText}`;
    });
}

function activate(context) {
    languages.registerHoverProvider({ pattern: '**/*.vue' }, {
        async provideHover(document, position) {
            if (!isPositionInBetweenTag('template', position)) {
                return;
            }

            jsFiles = await getJsFiles();
            const props = await getPropsForLine(position.line);

            if (!props) {
                return;
            }


            return {
                contents: hoverContentFromProps(props),
            };
        },
    });

    const componentsCompletionItemProvider = languages.registerCompletionItemProvider({ pattern: '**/*.vue' }, {
        async provideCompletionItems() {
            if (!isCursorInTemplateSection() || isCursorInsideComponent()) {
                return;
            }
            jsFiles = await getJsFiles();
            const files = await getVueFiles();

            return files.map(createComponentCompletionItem);
        },
    });

    const eventsCompletionItemProvider = languages.registerCompletionItemProvider({ pattern: '**/*.vue' }, {
        async provideCompletionItems(document, position) {
            if (!isCursorInsideComponent()) {
                return;
            }

            jsFiles = await getJsFiles();
            const events = await getEventsForLine(position.line, position.character);

            if (!events) {
                return;
            }

            return events.map(createEventCompletionItem);
        },
    }, '@');

    const propsCompletionItemProvider = languages.registerCompletionItemProvider({ pattern: '**/*.vue' }, {
        async provideCompletionItems(document, position) {
            if (!isCursorInsideComponent()) {
                return;
            }

            jsFiles = await getJsFiles();
            const props = await getPropsForLine(position.line, position.character);

            if (!props) {
                return;
            }

            return Object.keys(props).map(createPropCompletionItem);
        },
    }, ':');

    const importExisting = commands.registerCommand('vueDiscovery.importExisting', async () => {
        if (!hasScriptTagInactiveTextEditor()) {
            return window.showWarningMessage('Looks like there is no script tag in this file!');
        }

        const fileName = getComponentAtCursor();
        const file = (await getVueFiles()).find(file => file.includes(`${fileName}.vue`));

        if (!fileName || !file) {
            return;
        }

        jsFiles = await getJsFiles();

        await insertImport(file, fileName.toString());
        await insertComponent(fileName.toString());
    });

    const importFile = commands.registerCommand('vueDiscovery.importFile', async (file, fileName) => {
        if (!hasScriptTagInactiveTextEditor()) {
            return window.showWarningMessage('Looks like there is no script tag in this file!');
        }

        jsFiles = await getJsFiles();

        await insertImport(file, fileName);
        await insertComponent(fileName);
        await insertSnippet(file, fileName);
    });

    const setConfigOption = commands.registerCommand('vueDiscovery.tests.setConfigOption', (key, value) => {
        configOverride[key] = value;
    });
    context.subscriptions.push(componentsCompletionItemProvider, propsCompletionItemProvider, eventsCompletionItemProvider, importExisting, importFile, setConfigOption);
}

module.exports = {
    activate,
};