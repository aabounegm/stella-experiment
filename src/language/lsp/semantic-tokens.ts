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
  isAnnotation,
  isDeclFun,
  isDeclFunGeneric,
  isExtension,
  isGenericTypeVar,
  isParamDecl,
  isTypeVar,
  isVar,
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
    } else if (isDeclFun(node) || isDeclFunGeneric(node)) {
      acceptor({
        node,
        property: "name",
        type: SemanticTokenTypes.function,
        modifier: [SemanticTokenModifiers.declaration],
      });
    } else if (isAnnotation(node)) {
      if (node.$cstNode) {
        acceptor({
          cst: node.$cstNode,
          type: SemanticTokenTypes.decorator,
        });
      }
    } else if (isParamDecl(node)) {
      acceptor({
        node,
        property: "name",
        type: SemanticTokenTypes.parameter,
        modifier: [SemanticTokenModifiers.declaration],
      });
    } else if (isVar(node)) {
      if (node.ref.ref) {
        const { $type } = node.ref.ref;
        let tokenType = SemanticTokenTypes.variable;
        if ($type === "DeclFun" || $type === "DeclFunGeneric") {
          tokenType = SemanticTokenTypes.function;
        } else if ($type === "ParamDecl") {
          tokenType = SemanticTokenTypes.parameter;
        }
        // TODO: handle the variable being a param/variable having *type* function
        acceptor({
          node,
          property: "ref",
          type: tokenType,
        });
      }
    } else if (isGenericTypeVar(node)) {
      acceptor({
        node,
        property: "name",
        type: SemanticTokenTypes.typeParameter,
        modifier: [SemanticTokenModifiers.declaration],
      });
    } else if (isTypeVar(node)) {
      let tokenType = SemanticTokenTypes.type;
      if (node.ref.ref) {
        const { $type } = node.ref.ref;
        if ($type === "GenericTypeVar" || $type === "TypeRec") {
          tokenType = SemanticTokenTypes.typeParameter;
        }
      }
      acceptor({
        node,
        property: "ref",
        type: tokenType,
      });
    }
  }
}
