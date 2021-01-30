<span id="BADGE_GENERATION_MARKER_0"></span>
[![circleci](https://img.shields.io/circleci/build/github/TheRealSyler/vscode-sass-indented)](https://app.circleci.com/github/TheRealSyler/vscode-sass-indented/pipelines) [![Custom](https://www.codefactor.io/repository/github/therealsyler/vscode-sass-indented/badge)](https://www.codefactor.io/repository/github/therealsyler/vscode-sass-indented) [![vscV](https://img.shields.io/visual-studio-marketplace/v/syler.sass-indented)](https://marketplace.visualstudio.com/items?itemName=syler.sass-indented) [![vscD](https://img.shields.io/visual-studio-marketplace/d/syler.sass-indented)](https://marketplace.visualstudio.com/items?itemName=syler.sass-indented) [![vscI](https://img.shields.io/visual-studio-marketplace/i/syler.sass-indented)](https://marketplace.visualstudio.com/items?itemName=syler.sass-indented) [![githubLastCommit](https://img.shields.io/github/last-commit/TheRealSyler/vscode-sass-indented)](https://github.com/TheRealSyler/vscode-sass-indented) [![githubIssues](https://img.shields.io/github/issues/TheRealSyler/vscode-sass-indented?color=lightgrey)](https://github.com/TheRealSyler/vscode-sass-indented)
<span id="BADGE_GENERATION_MARKER_1"></span>

[![Tested With](https://img.shields.io/badge/Syntax Tested With-test--grammar-red?style=for-the-badge)](https://www.npmjs.com/package/test-grammar)
[![Using](https://img.shields.io/badge/Using-sass--formatter-red?style=for-the-badge)](https://www.npmjs.com/package/sass-formatter)

# _Indented Sass syntax highlighting, autocomplete & Formatter for VSCode_

## **_Installing_**

Search for Sass from the extension installer within VSCode or put this into the command palette.

```cmd
ext install sass-indented
```

## **Features**

> Syntax Highlighting

> AutoCompletions / Intellisense

> [Formatter](https://github.com/TheRealSyler/sass-formatter)

> Hover Info

## **Configuration**

Configuration options can be set in the `Sass (Indented)` section of VSCode settings or by editing your `settings.json` directly.

### General

| Option                       | Type    | Default                                     | Description                                                                                               |
| ---------------------------- | ------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `sass.lint.enable`           | boolean | false                                       | Enables sass lint, its useless at the moment i abandoned the project, i might work on it in the future.   |
| `sass.disableAutoIndent`     | boolean | false                                       | Stop the extension from automatically indenting when pressing Enter                                       |
| `sass.disableUnitCompletion` | boolean | true                                        | adds units to the intellisense completions if false.                                                      |
| `sass.andStared`             | array   | `["active", "focus", "hover", "nth-child"]` | items in this array will be at the top of the completion list (only for items that show after the & sign) |

### Formatter

| Option                         | Type    | Default | Description                                                    |
| ------------------------------ | ------- | ------- | -------------------------------------------------------------- |
| `sass.format.enabled`          | boolean | true    | enables the sass formatter.                                    |
| `sass.format.deleteWhitespace` | boolean | true    | removes trailing whitespace.                                   |
| `sass.format.deleteEmptyRows`  | boolean | true    | removes empty rows.                                            |
| `sass.format.setPropertySpace` | boolean | true    | If true space between the property: value, is always set to 1. |

## Usage tips

### Variable Completion

You can import using variables and mixins using `@import` or `@use`, if you want to only import the css variables, you can easily do that by using a magic comment `//import css-variables from <File Path>`.

> Note: at the moment all variables are global scoped meaning if you declare a variable inside a class you will get

## **Bugs**

> **_IMPORTANT_**: if the bug is related to the formatter please open the issue in the formatter [repo](https://github.com/TheRealSyler/sass-formatter/issues/new?assignees=TheRealSyler&labels=bug&template=bug_report.md&title=).

If you encounter any bugs please [open a new issue](https://github.com/TheRealSyler/vscode-sass-indented/issues/new?assignees=TheRealSyler&labels=bug&template=bug_report.md&title=).

## **Contributing**

The source for this extension is available on [github](https://github.com/TheRealSyler/vscode-sass-indented). If anyone feels that there is something missing or would like to suggest improvements please [open a new issue](https://github.com/TheRealSyler/vscode-sass-indented/issues/new?assignees=TheRealSyler&labels=enhancement&template=feature_request.md&title=) or send a pull request! Instructions for running/debugging extensions locally [here](https://code.visualstudio.com/docs/extensions/overview).

> Note: if you want to contribute to the formatter go to this [repo](https://github.com/TheRealSyler/sass-formatter), there is no documentation at the moment, i should probably add it since kinda forgetting how the formatter works myself, so if you want to know how to change something open a new issue and i can probably explain what you need to do.

## **Credits**

- Thanks to [@robinbentley](https://github.com/robinbentley) for creating and maintaining the project until version 1.5.1.
- Property/Value Autocompletion - [Stanislav Sysoev (@d4rkr00t)](https://github.com/d4rkr00t) for his work on [language-stylus](https://github.com/d4rkr00t/language-stylus) extension
- Syntax highlighting - [https://github.com/P233/Syntax-highlighting-for-Sass](https://github.com/P233/Syntax-highlighting-for-Sass)
- Sass seal logo - [http://sass-lang.com/styleguide/brand](http://sass-lang.com/styleguide/brand)

## Changelog

The full changelog is available here: [changelog](https://github.com/TheRealSyler/vscode-sass-indented/blob/master/CHANGELOG.md).

## License

[MIT - https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT)
