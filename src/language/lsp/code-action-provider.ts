import {
  AstUtils,
  CstUtils,
  GrammarUtils,
  LangiumDocument,
  MaybePromise,
} from "langium";
import { CodeActionProvider, LangiumServices } from "langium/lsp";
import type { Diagnostic } from "vscode-languageserver";
import type { CodeActionParams } from "vscode-languageserver-protocol";
import {
  CodeActionKind,
  Range,
  type CodeAction,
  type Command,
} from "vscode-languageserver-types";
import { DiagnosticCodes } from "../validator/errors.js";
import { isExtension } from "../generated/ast.js";

export class StellaCodeActionProvider implements CodeActionProvider {
  constructor(services: LangiumServices) {}

  getCodeActions(
    document: LangiumDocument,
    params: CodeActionParams
  ): MaybePromise<Array<Command | CodeAction>> {
    const result: CodeAction[] = params.context.diagnostics
      .flatMap((diag) => this.createCodeActions(diag, document))
      .filter((action) => !!action);

    return result;
  }

  private removeRedundantExtension(
    diagnostic: Diagnostic,
    document: LangiumDocument
  ): CodeAction | undefined {
    const offset = document.textDocument.offsetAt(diagnostic.range.start);
    const rootCst = document.parseResult.value.$cstNode;
    if (!rootCst) {
      return;
    }

    const extensionNameCstNode = CstUtils.findLeafNodeAtOffset(rootCst, offset);
    const extension = AstUtils.getContainerOfType(
      extensionNameCstNode?.astNode,
      isExtension
    );

    if (!extension || !extension.$cstNode) {
      return;
    }

    const createExtRemoveAction = (range: Range): CodeAction => ({
      title: "Remove redundant extension",
      kind: CodeActionKind.QuickFix,
      diagnostics: [diagnostic],
      edit: {
        changes: {
          [document.textDocument.uri]: [
            {
              range,
              newText: "",
            },
          ],
        },
      },
    });

    if (extension.extensionNames.length === 1) {
      // The only one in the list, remove the whole declaration
      return createExtRemoveAction(extension.$cstNode.range);
    }

    const idx = extension.extensionNames.indexOf(extensionNameCstNode!.text);
    if (idx === -1) {
      // Should not happen
      return;
    }

    if (idx === extension.extensionNames.length - 1) {
      // Last one in the list, remove it with the comma before it
      const prevExtRange = GrammarUtils.findNodeForProperty(
        extension.$cstNode,
        "extensionNames",
        idx - 1
      )?.range;
      if (!prevExtRange) {
        return;
      }
      return createExtRemoveAction({
        start: prevExtRange.end,
        end: extensionNameCstNode!.range.end,
      });
    }

    // In the middle (or beginning) of the list, remove the comma as well
    const nextExtRange = GrammarUtils.findNodeForProperty(
      extension.$cstNode,
      "extensionNames",
      idx + 1
    )?.range;
    if (!nextExtRange) {
      return;
    }

    return createExtRemoveAction({
      start: extensionNameCstNode!.range.start,
      end: nextExtRange.start,
    });
  }

  private createCodeActions(
    diagnostic: Diagnostic,
    document: LangiumDocument
  ): CodeAction | CodeAction[] | undefined {
    switch (diagnostic.code) {
      case DiagnosticCodes.DUPLICATE_EXTENSION:
        return this.removeRedundantExtension(diagnostic, document);
    }
    return [];
  }
}
