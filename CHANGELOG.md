# Changelog

All notable changes to the "stella-language-server" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [v0.1.2]

### Added

- Validation for unique function names and for the presence of a `main` function.
- Add copy code/output buttons to the playground.
- Hover provider with link to documentation for extensions.
- IntelliSense (code completion) support for extensions.
- Validation and quick fix to remove redundant extensions.

### Changed

- Isolated each file as a separate program. Previously, Langium made all symbols in a program visible in other files, but Stella does not support import/export.

## [v0.1.1]

### Fixed

- Added syntax highlighting grammar file to `package.json`.

## [v0.1.0]

The extension was rewritten from scratch to use [Langium](https://langium.org/) and provide a language server that uses LSP.

### Added

- Parsing diagnostics
- Semantic highlighting
- Reference resolution (go to definition, find all references)
- AST viewer

## [v0.0.5]

- Added syntax highlighting support for references, exceptions, and type casting.

## [v0.0.4]

- Improved syntax highlighting

## [v0.0.3]

- Added code snippets

## v0.0.2

- Added support for highlighting Stella code in fenced code blocks in Markdown

## v0.0.1

- Initial release
- Basic syntax highlighting and file icon

[Unreleased]: https://github.com/aabounegm/stella-experiment/compare/v0.1.2...HEAD
[v0.1.2]: https://github.com/aabounegm/stella-experiment/releases/tag/v0.1.2
[v0.1.1]: https://github.com/aabounegm/stella-experiment/releases/tag/v0.1.1
[v0.1.0]: https://github.com/aabounegm/stella-experiment/releases/tag/v0.1.0
[v0.0.5]: https://github.com/IU-ACCPA-2023/vscode-stella/releases/tag/v0.0.5
[v0.0.4]: https://github.com/IU-ACCPA-2023/vscode-stella/releases/tag/v0.0.4
[v0.0.3]: https://github.com/IU-ACCPA-2023/vscode-stella/releases/tag/v0.0.3
