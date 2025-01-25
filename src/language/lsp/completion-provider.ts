import { MaybePromise } from "langium";
import {
  CompletionAcceptor,
  CompletionContext,
  DefaultCompletionProvider,
  NextFeature,
} from "langium/lsp";

export class CompletionProvider extends DefaultCompletionProvider {
  // TODO: Make the snippets context-dependent
  // For example, top-level constructs (function, lang, extensions, ...) only in top-level
  // if/else, let-bindings, ... only in expressions

  protected override completionFor(
    context: CompletionContext,
    next: NextFeature,
    acceptor: CompletionAcceptor
  ): MaybePromise<void> {
    // const { node, tokenOffset, tokenEndOffset } = context;

    return super.completionFor(context, next, acceptor);
  }
}
