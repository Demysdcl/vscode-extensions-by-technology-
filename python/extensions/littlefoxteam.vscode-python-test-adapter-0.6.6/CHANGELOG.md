## 0.6.6

* Add test suites for parameterized tests (Issue [#155](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/155))
* Migrated build from TravisCI to GitHub Actions

## 0.6.5

* Update dependencies

## 0.6.4

* Support the debuggers envFile configuration (Issue [#204](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/204), thanks to @matthewshirley)

## 0.6.3

* Show stderr in test output for pytest (Issue [#205](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/205))

## 0.6.2

* Always set rootdir to current working directory (Issue [#198](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/198))

## 0.6.1

* Fallback if failed to auto-detect pythonPath, fix vscodeignore (Issue [#196](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/196))

## 0.6.0

* Support for auto-reload and auto-run for tests (Issues [#137](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/137) and [#193](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/193))
* Support for `python.pythonPath` deprecation (Issue [#177](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/177))
* Add onStartupFinished activation event (Issue [#186](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/186))

## 0.5.0

* Support for `python.testing.pytestPath` setting (Issue [#60](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/60), thanks to @lucono)
* Support `name` and `console` in debug configuration in launch.json (Issue [#185](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/185))
* Run tests on Python 3.8 in CI
* Update dependencies (thanks to @lucono)

## 0.4.6

* Update dependencies, migrate to vscode-test
* Support for custom junitxml argument (Issue [#172](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/172))

## 0.4.5

* Load debug configuration from launch.json (Issues [#139](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/139) and [#167](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/167))

## 0.4.4

* Handle errors during setup for unittest
* Add section on Test Explorer UI configuration to README

## 0.4.3

* Fix cwd resolution (Issue [#158](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/158))
* Update dependencies
* Refactor errored suites reporting to new Test Explorer UI API

## 0.4.2

* Upadate dependencies, add CHANGELOG (Issues [#147](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/147) and [#145](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/145))
* Force pytest to use xunit1 report (Issue [#141](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/141))

## 0.4.1

* Fix multiple test execution with a similar name for unittest
* Fix unittest debug for when start directory is not a current working directory (Issue [#57](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/57))
* Improved error reporting for unittest

## 0.4.0

* Fix pytest decorations (Issue [#132](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/132))
* Add debug support for unittest (Issue [#57](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/57))

## 0.3.18

* Add additional activation events (Issue [#125](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/125))
* Better error reporting on invalid arguments (Issue [#133](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/133))
* Update dependencies

## 0.3.17

* Show discovery errors in Test Explorer UI for unittests (Issue [#118](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/118))

## 0.3.16

* Fix debug config, add pytest mark tests (Issue [#116](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/116))
* Update dependencies

## 0.3.15

* Update dependencies
* Attempt to fix environment variable resolution for debug configuration (Issue [#110](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/110))

## 0.3.14

* Add file property for unittest test methods (Issue [#106](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/106))

## 0.3.13

* Update dependencies
* Handle pytest positional arguments - filtering tests (Issue [#102](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/102))

## 0.3.12

* Show discovery errors in Test Explorer UI (Issue [#98](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/98))

## 0.3.11

* Better error reporting for pytest (Issue [#98](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/98))

## 0.3.10

* Update dependencies
* Add Tavern pytest plugin support (Issue [#97](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/97))

## 0.3.9

* Update dependencies
* Fix pytest 5.1.0 compatibility on parsing junit xml

## 0.3.8

* Update dependencies
* Add environment variable resolution for .env file (Issue [#88](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/88))
* Support renaming configuration settings of python extension

## 0.3.7

* Make Python 3.7 default for tests, add CI tests with Python 3.7
* Update dependencies
* Fix README, improved contributing guide

## 0.3.6

* Update dependencies
* Fix home path resolution in configuration

## 0.3.5

* Update dependencies
* Fix renaming configuration settings (Issue [#78](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/78))

## 0.3.4

* Fix tear down calls (Issue [#73](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/73))

## 0.3.3

* Replace label modification with description when there are equal labels on the same test tree level
* Update packages

## 0.3.2

* Update packages

## 0.3.1

* Fix pytest arguments passing for debugging
* Fix unittest arguments passing (Issue [#64](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/64))

## 0.3.0

* Support python.unitTest.pyTestArgs configuration property (Issue [#19](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/19))
* Output capturing for unittest tests (Issue [#5](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/5))

## 0.2.8

* Support "Show source" button for pytest test cases
* Add test cancellation (Issue [#42](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/42))

## 0.2.7

* Add more placeholders for configuration (`workspaceRoot`, `workspaceFolderBasename`, `workspaceRootFolderName`, `cwd`) (Issues [#53](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/53) and [#52](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/52))
* Add additional part to test labels to distinguish (Issue [#40](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/40))

## 0.2.6

* Fix discovery for pytest >= 4.1.1 (Issue [#47](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/47))
* Add output capturing from pytest
* Add simplified pytest debugging

## 0.2.5

* Add support for pytest-describe plugin (Issue [#45](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/45))
* Add CI builds for Linux, Windows and macOS with Azure Pipelines

## 0.2.4

* Fix environment passing to python process (Issue [#37](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/37))
* Add .env file loading for python process (Issue [#27](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/27))
* Sort test cases alphabetically (Issue [#31](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/31))
* Add Dependencies Status badge

## 0.2.3

* Update vscode-test-adapter-api package (Issue [#6](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/6))
* Add logging (Issue [#7](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/7))

## 0.2.2

* Fix vulnerability (Issue [dominictarr/event-stream#116](https://github.com/dominictarr/event-stream/issues/116)), update packages

## 0.2.1

* Add placeholder resolution in configuration (Issue [#22](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/22))
* Add contributing guide
* Fix check for overridden python test framework switch

## 0.2.0

* Add pytest support (Issue [#3](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/3))
* Do not show suite when no tests discovered

## 0.1.4

* Add configuration property to override the test framework used by extension (Issue [#14](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/14))

## 0.1.3

* Fix `setUpClass` method was not called (Issue [#9](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/9))
* Fix suite discovery when module printed text on import (Issue [#8](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/8))

## 0.1.2

* Fix README formatting
* Add .tavis.yml to .vscodeignore

## 0.1.1

* Support for Multi-root Workspaces (Issue [#2](https://github.com/kondratyev-nv/vscode-python-test-adapter/issues/2))

## 0.1.0

* Initial release
