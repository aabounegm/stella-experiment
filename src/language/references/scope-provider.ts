import {
  AstNode,
  AstUtils,
  DefaultScopeProvider,
  ReferenceInfo,
  Scope,
} from "langium";
import {
  isLabelledPattern,
  isLet,
  isLetRec,
  isMatch,
  isParenthesisedPattern,
  isPatternAsc,
  isPatternBinding,
  isPatternCastAs,
  isPatternCons,
  isPatternInl,
  isPatternInr,
  isPatternList,
  isPatternRecord,
  isPatternSucc,
  isPatternTuple,
  isPatternVar,
  isPatternVariant,
  isTryCastAs,
  isTryCatch,
  isVar,
  PatternVar,
} from "../generated/ast.js";
import { LangiumServices } from "langium/lsp";

export class StellaScopeProvider extends DefaultScopeProvider {
  constructor(services: LangiumServices) {
    super(services);
  }

  override getScope(context: ReferenceInfo): Scope {
    let scope = super.getScope(context);
    const { container } = context;

    if (isVar(container)) {
      // Langium doesn't find `PatternVar`s for some reason,
      // so we add all patterns from all parent nodes to the scope
      const introducesVars = (node: AstNode) =>
        isLet(node) ||
        isLetRec(node) ||
        isMatch(node) ||
        isTryCatch(node) ||
        isTryCastAs(node);
      let parentVarDecl = AstUtils.getContainerOfType(
        container,
        introducesVars
      );
      while (parentVarDecl) {
        const patternVars = this.extractPatternVars(parentVarDecl);
        scope = this.createScopeForNodes(patternVars, scope);
        parentVarDecl = AstUtils.getContainerOfType(
          parentVarDecl.$container,
          introducesVars
        );
      }
    }

    return scope;
  }

  private extractPatternVars(node: AstNode): PatternVar[] {
    if (isPatternVar(node)) {
      return [node];
    }
    if (
      isPatternBinding(node) ||
      isParenthesisedPattern(node) ||
      isPatternAsc(node) ||
      isPatternCastAs(node) ||
      isPatternBinding(node) ||
      isPatternInl(node) ||
      isPatternInr(node) ||
      isLabelledPattern(node) ||
      isPatternSucc(node) ||
      isTryCatch(node) ||
      isTryCastAs(node)
    ) {
      return this.extractPatternVars(node.pattern);
    }
    if (isPatternVariant(node) && node.pattern) {
      return this.extractPatternVars(node.pattern);
    }
    if (isPatternTuple(node) || isPatternRecord(node) || isPatternList(node)) {
      return node.patterns.flatMap((pat) => this.extractPatternVars(pat));
    }
    if (isPatternCons(node)) {
      return this.extractPatternVars(node.head).concat(
        this.extractPatternVars(node.tail)
      );
    }
    if (isLet(node) || isLetRec(node)) {
      return node.patternBindings.flatMap((pat) =>
        this.extractPatternVars(pat)
      );
    }
    if (isMatch(node)) {
      return node.cases.flatMap((matchCase) =>
        this.extractPatternVars(matchCase.pattern)
      );
    }
    return [];
  }
}
