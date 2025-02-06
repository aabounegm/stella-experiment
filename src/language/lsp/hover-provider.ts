import { AstNode, CstUtils, LangiumDocument, MaybePromise } from "langium";
import { AstNodeHoverProvider } from "langium/lsp";
import { Hover, HoverParams } from "vscode-languageserver";
import { isExtension } from "../generated/ast.js";
import { extensionDocLinks, isRecognizedExtension } from "../extensions.js";

export class HoverProvider extends AstNodeHoverProvider {
  override async getHoverContent(
    document: LangiumDocument,
    params: HoverParams
  ): Promise<Hover | undefined> {
    const superRes = await super.getHoverContent(document, params);
    if (superRes) {
      return superRes;
    }

    const root = document.parseResult.value.$cstNode;
    if (!root) {
      return;
    }
    const offset = document.textDocument.offsetAt(params.position);
    const extNameCstNode = CstUtils.findLeafNodeAtOffset(root, offset);

    if (!extNameCstNode) {
      return;
    }

    if (
      isExtension(extNameCstNode.astNode) &&
      isRecognizedExtension(extNameCstNode.text)
    ) {
      // Extension specifically needs the LeafCstNode at hover position (not provided to `getAstNodeHoverContent`)
      // TODO: open a PR to Langium to provide the HoverParams (or at least the position) to `getAstNodeHoverContent`

      const link = extensionDocLinks[extNameCstNode.text];
      if (!link) {
        return;
      }

      return {
        contents: {
          kind: "markdown",
          value: `[Go to documentation](${link})`,
        },
        range: extNameCstNode.range,
      };
    }

    return this.getAstNodeHoverContent(extNameCstNode.astNode);
  }

  protected override getAstNodeHoverContent(
    node: AstNode
  ): MaybePromise<Hover | undefined> {
    return undefined;
  }
}
