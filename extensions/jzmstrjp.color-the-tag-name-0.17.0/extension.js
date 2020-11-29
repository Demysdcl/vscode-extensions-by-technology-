// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const tagInfos = [
	{decChar: undefined, tagName: "style", tagColor: "#ffa200"},
	{decChar: undefined, tagName: "a", tagColor: "rgb(90, 255, 123)"},
	{decChar: undefined, tagName: "abbr", tagColor: "#fff600"},
	{decChar: undefined, tagName: "address", tagColor: "#ee6"},
	{decChar: undefined, tagName: "area", tagColor: "#47ff6d"},
	{decChar: undefined, tagName: "article", tagColor: "#fc0"},
	{decChar: undefined, tagName: "aside", tagColor: "#ffca96"},
	{decChar: undefined, tagName: "audio", tagColor: "#a1ffd0"},
	{decChar: undefined, tagName: "b", tagColor: "#eaf"},
	{decChar: undefined, tagName: "base", tagColor: "#aeff00"},
	{decChar: undefined, tagName: "blockquote", tagColor: "#ffb7ad"},
	{decChar: undefined, tagName: "q", tagColor: "#ffb7ad"},
	{decChar: undefined, tagName: "body", tagColor: "#a9ffb3"},
	{decChar: undefined, tagName: "br", tagColor: "#fcdfb5"},
	{decChar: undefined, tagName: "button", tagColor: "#fbb"},
	{decChar: undefined, tagName: "canvas", tagColor: "#6cf"},
	{decChar: undefined, tagName: "caption", tagColor: "#6dd"},
	{decChar: undefined, tagName: "cite", tagColor: "#ff8888"},
	{decChar: undefined, tagName: "code", tagColor: "#adda04"},
	{decChar: undefined, tagName: "col", tagColor: "#a4d5ff"},
	{decChar: undefined, tagName: "colgroup", tagColor: "#acb5ff"},
	{decChar: undefined, tagName: "dd", tagColor: "#dd9"},
	{decChar: undefined, tagName: "del", tagColor: "#a8a8a8"},
	{decChar: undefined, tagName: "dfn", tagColor: "#bfa"},
	{decChar: undefined, tagName: "div", tagColor: "rgb(206, 228, 231)"},
	{decChar: undefined, tagName: "dl", tagColor: "#e93"},
	{decChar: undefined, tagName: "dt", tagColor: "#9df"},
	{decChar: undefined, tagName: "em", tagColor: "#ef71ff"},
	{decChar: undefined, tagName: "fieldset", tagColor: "#fce"},
	{decChar: undefined, tagName: "figcaption", tagColor: "#aaf"},
	{decChar: undefined, tagName: "figure", tagColor: "#e6eecc"},
	{decChar: undefined, tagName: "footer", tagColor: "#ffe400"},
	{decChar: undefined, tagName: "form", tagColor: "#00ffc6"},
	{decChar: undefined, tagName: "h1", tagColor: "rgb(255, 130, 130)"},
	{decChar: undefined, tagName: "h2", tagColor: "rgb(255, 138, 216)"},
	{decChar: undefined, tagName: "h3", tagColor: "#e7e578"},
	{decChar: undefined, tagName: "h4", tagColor: "#a3ff99"},
	{decChar: undefined, tagName: "h5", tagColor: "rgb(94, 223, 255)"},
	{decChar: undefined, tagName: "h6", tagColor: "rgb(204, 160, 255)"},
	{decChar: undefined, tagName: "head", tagColor: "#dda"},
	{decChar: undefined, tagName: "header", tagColor: "#faa"},
	{decChar: undefined, tagName: "hgroup", tagColor: "#fac"},
	{decChar: undefined, tagName: "hr", tagColor: "#efc"},
	{decChar: undefined, tagName: "html", tagColor: "#cac"},
	{decChar: undefined, tagName: "i", tagColor: "#fffe80"},
	{decChar: undefined, tagName: "iframe", tagColor: "#ff80c2"},
	{decChar: undefined, tagName: "image", tagColor: "#48dfff"},
	{decChar: undefined, tagName: "img", tagColor: "#48dfff"},
	{decChar: undefined, tagName: "input", tagColor: "#dcc"},
	{decChar: undefined, tagName: "ins", tagColor: "#ffccf1"},
	{decChar: undefined, tagName: "kbd", tagColor: "#9fc"},
	{decChar: undefined, tagName: "label", tagColor: "#ff7e00"},
	{decChar: undefined, tagName: "legend", tagColor: "#afe"},
	{decChar: undefined, tagName: "li", tagColor: "#fbb"},
	{decChar: undefined, tagName: "link", tagColor: "rgb(156, 255, 131)"},
	{decChar: undefined, tagName: "main", tagColor: "#42ff00"},
	{decChar: undefined, tagName: "map", tagColor: "#fff000"},
	{decChar: undefined, tagName: "mark", tagColor: "#fcff00"},
	{decChar: undefined, tagName: "menu", tagColor: "#3bf"},
	{decChar: undefined, tagName: "meta", tagColor: "#aff"},
	{decChar: undefined, tagName: "nav", tagColor: "#00ffff"},
	{decChar: undefined, tagName: "noscript", tagColor: "#ff7979"},
	{decChar: undefined, tagName: "object", tagColor: "#ff7e7e"},
	{decChar: undefined, tagName: "ol", tagColor: "#9ac"},
	{decChar: undefined, tagName: "optgroup", tagColor: "#eeb"},
	{decChar: undefined, tagName: "option", tagColor: "#edd"},
	{decChar: undefined, tagName: "p", tagColor: "#ffcc00"},
	{decChar: undefined, tagName: "pre", tagColor: "#ffb304"},
	{decChar: undefined, tagName: "rb", tagColor: "#dac"},
	{decChar: undefined, tagName: "rp", tagColor: "#fdc"},
	{decChar: undefined, tagName: "rt", tagColor: "#afb"},
	{decChar: undefined, tagName: "ruby", tagColor: "#dea"},
	{decChar: undefined, tagName: "s", tagColor: "#bbb3d7"},
	{decChar: undefined, tagName: "samp", tagColor: "#fe3"},
	{decChar: undefined, tagName: "script", tagColor: "rgb(66, 224, 255)"},
	{decChar: undefined, tagName: "section", tagColor: "#ffccdd"},
	{decChar: undefined, tagName: "select", tagColor: "#cff"},
	{decChar: undefined, tagName: "small", tagColor: "#aaf"},
	{decChar: undefined, tagName: "source", tagColor: "#48dfff"},
	{decChar: undefined, tagName: "span", tagColor: "#bbf6ff"},
	{decChar: undefined, tagName: "strong", tagColor: "#fc9"},
	{decChar: undefined, tagName: "sub", tagColor: "#add"},
	{decChar: undefined, tagName: "summary", tagColor: "#fc0"},
	{decChar: undefined, tagName: "sup", tagColor: "#cdf"},
	{decChar: undefined, tagName: "svg", tagColor: "#6fd"},
	{decChar: undefined, tagName: "table", tagColor: "#ef9"},
	{decChar: undefined, tagName: "tbody", tagColor: "#fcb"},
	{decChar: undefined, tagName: "td", tagColor: "#ff8"},
	{decChar: undefined, tagName: "textarea", tagColor: "#ed9"},
	{decChar: undefined, tagName: "tfoot", tagColor: "rgb(35, 226, 255)"},
	{decChar: undefined, tagName: "th", tagColor: "#ff99f2"},
	{decChar: undefined, tagName: "thead", tagColor: "#f88"},
	{decChar: undefined, tagName: "time", tagColor: "#9eff6f"},
	{decChar: undefined, tagName: "title", tagColor: "#fcc"},
	{decChar: undefined, tagName: "tr", tagColor: "#aaeec4"},
	{decChar: undefined, tagName: "ul", tagColor: "#ffa"},
	{decChar: undefined, tagName: "video", tagColor: "#efc"},
	{decChar: undefined, tagName: "wbr", tagColor: "#fcdfb5"},
];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Also trigger an update on changing the editor
    vscode.window.onDidChangeActiveTextEditor(editor => {
        decorate();
    }, null, context.subscriptions);
    // And when modifying the document
    vscode.workspace.onDidChangeTextDocument(event => {
        decorate();
    }, null, context.subscriptions);
    decorate();
    // functions
    function decorate() {
		var editor = vscode.window.activeTextEditor;
        var src = editor.document.getText();
        tagInfos.forEach(function(tagInfo){
            decorate_inner(tagInfo, editor, src);
        });
	}
	function decorate_inner(tagInfo, editor, src) {
		vscode.window.setStatusBarMessage('');
		if (tagInfo.decChar != undefined) {
			tagInfo.decChar.decorator.dispose();
		}
		var regex = new RegExp('<!--|-->|<(/|)' + tagInfo.tagName + '(| (.*?)[^-?%$])>', 'gm');
		var match;
		var inComment = false;
		tagInfo.decChar = {
			'chars': [],
			'decorator': vscode.window.createTextEditorDecorationType({
				'color': tagInfo.tagColor
			})
		};
		while (match = regex.exec(src)) {
			var startPos = editor.document.positionAt(match.index);
			var endPos = editor.document.positionAt(match.index + match[0].length);
			var range = new vscode.Range(startPos, endPos);
			var splited = match[0].split('"');
			//コメントだったら飛ばす
			if(match[0] === "<!--"){
				//console.log("コメント開始");
				inComment = true;
				continue;
			}
			if(match[0] === "-->"){
				//console.log("コメント終了");
				inComment = false;
				continue;
			}
			if(inComment === true){
				continue;
			}
			var single_lengths = 0;
			if(splited.length){
				splited.forEach(function(single, i){
					//偶数だったら
					if(i % 2 === 0){
						var startPos2 = editor.document.positionAt(match.index + single_lengths);
						var endPos2 = editor.document.positionAt(match.index + single_lengths + single.length);
						var range2 = new vscode.Range(startPos2, endPos2);
						tagInfo.decChar.chars.push(range2);
					}
					single_lengths += single.length + 1;
				});
			}
		}
		editor.setDecorations(tagInfo.decChar.decorator, tagInfo.decChar.chars);
	}
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;