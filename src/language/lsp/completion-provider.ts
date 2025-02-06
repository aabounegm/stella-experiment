import { CstUtils, MaybePromise } from "langium";
import type {
  CompletionAcceptor,
  CompletionContext,
  NextFeature,
} from "langium/lsp";
import { DefaultCompletionProvider } from "langium/lsp";
import { isExtension } from "../generated/ast.js";
import { extensionValues, getExtensions } from "../extensions.js";

export class CompletionProvider extends DefaultCompletionProvider {
  // TODO: Make the snippets context-dependent
  // For example, top-level constructs (function, lang, extensions, ...) only in top-level
  // if/else, let-bindings, ... only in expressions
  // Reference: https://github.com/TypeFox/langium-ui-framework/blob/main/src/language-server/simple-ui-completion.ts

  protected override completionFor(
    context: CompletionContext,
    next: NextFeature,
    acceptor: CompletionAcceptor
  ): MaybePromise<void> {
    if (isExtension(context.node)) {
      const usedExtensions = getExtensions(context.node.$container);
      // Don't consider the extension being typed now as used (to keep it in the completion list even after being fully typed)
      // So that the commit characters below wouldn't possibly accept a different suggestion by mistake
      if (context.node.$cstNode) {
        const leaf = CstUtils.findLeafNodeAtOffset(
          context.node.$cstNode,
          context.tokenOffset
        );
        if (leaf) {
          usedExtensions.delete(leaf.text);
        }
      }

      extensionValues.difference(usedExtensions).forEach((extensionName) => {
        acceptor(context, {
          label: extensionName,
          commitCharacters: [",", ";"],
        });
      });
    }

    return super.completionFor(context, next, acceptor);
  }
}
