import type { AstNode } from "langium";
import {
  AbstractSemanticTokenProvider,
  type SemanticTokenAcceptor,
} from "langium/lsp";
import {
  SemanticTokenTypes,
  SemanticTokenModifiers,
} from "vscode-languageserver-protocol";
import {
  isDeclFun,
  isExtension,
  isParamDecl,
  type StellaAstType,
} from "../generated/ast.js";

const funcKeywords: Partial<Record<keyof StellaAstType, string>> = {
  Inl: "inl",
  Inr: "inr",
  ConsList: "cons",
  Head: "List::head",
  IsEmpty: "List::isEmpty",
  Tail: "List::tail",
  Succ: "succ",
  LogicNot: "not",
  Pred: "Nat::pred",
  IsZero: "Nat::iszero",
  Fix: "fix",
  NatRec: "Nat::rec",
  Fold: "fold",
  Unfold: "unfold",
  Ref: "new",
};

export class SemanticTokenProvider extends AbstractSemanticTokenProvider {
  protected override highlightElement(
    node: AstNode,
    acceptor: SemanticTokenAcceptor
  ): void | "prune" | undefined {
    if (isExtension(node)) {
      acceptor({
        node,
        property: "extensionNames",
        type: SemanticTokenTypes.macro,
      });
    } else if (node.$type in funcKeywords) {
      // Built-in functions
      acceptor({
        node,
        keyword: funcKeywords[node.$type as keyof StellaAstType]!,
        type: SemanticTokenTypes.function,
        modifier: [SemanticTokenModifiers.defaultLibrary],
      });
    } else if (isDeclFun(node)) {
      // TODO: check other properties
      acceptor({
        node,
        property: "name",
        type: SemanticTokenTypes.function,
        modifier: [SemanticTokenModifiers.declaration],
      });
    } else if (isParamDecl(node)) {
      acceptor({
        node,
        property: "name",
        type: SemanticTokenTypes.parameter,
        modifier: [SemanticTokenModifiers.declaration],
      });
    }
  }
}
