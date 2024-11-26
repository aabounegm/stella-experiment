import * as vscode from "vscode";
import { AstNodeWithTextRegion } from "langium";
import { LanguageClient } from "vscode-languageclient/node.js";

type Node = Required<Pick<AstNodeWithTextRegion, "$type" | "$textRegion">> & {
  [key: string]: Node | LangiumValue;
};

/** The types allowed in a terminal rule's returns type */
type LangiumPrimitive = string | number | boolean | bigint | Date;
type LangiumValue = LangiumPrimitive | LangiumPrimitive[];
type NodeProperty = { key: string; value: LangiumValue | Node };

type Element = Node | NodeProperty | LangiumValue;

function isNode(value: unknown): value is Node {
  return (
    typeof value === "object" &&
    value !== null &&
    "$type" in value &&
    "$textRegion" in value
  );
}

function isNodeProperty(value: unknown): value is NodeProperty {
  return (
    typeof value === "object" &&
    value !== null &&
    "key" in value &&
    "value" in value
  );
}

function isLangiumPrimitive(value: unknown): value is LangiumPrimitive {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date ||
    typeof value === "bigint"
  );
}

export class SyntaxTreeProvider implements vscode.TreeDataProvider<Element> {
  constructor(private client: LanguageClient) {}

  private _onDidChangeTreeData: vscode.EventEmitter<void> =
    new vscode.EventEmitter();
  readonly onDidChangeTreeData: vscode.Event<void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  async getChildren(element?: Element): Promise<Element[]> {
    if (!element) {
      // First request (for whole document), get the AST from the language server
      const document = vscode.window.activeTextEditor?.document;
      if (!document || document.languageId !== "stella") {
        return [];
      }
      const uri = document.uri.toString();

      const tree = await this.client.sendRequest<string>("stella/syntaxTree", {
        uri,
      });

      return [JSON.parse(tree) as Node];
    }

    if (isNode(element)) {
      // Get all non-$ properties of the AST node
      return Object.entries<Node | LangiumValue>(element)
        .filter(([key, _]) => !key.startsWith("$"))
        .map(([key, value]) => {
          return { key, value };
        });
    }
    if (isNodeProperty(element)) {
      const { value } = element;
      if (Array.isArray(value)) {
        return value;
      }
      return [value];
    }
    return [];
  }

  getTreeItem(element: Element): vscode.TreeItem {
    const typeIcons: Record<string, string> = {
      bigint: "symbol-number",
      number: "symbol-number",
      string: "symbol-text",
      boolean: "symbol-boolean",
      object: "calendar", // Date is the only object treated by Langium as a terminal token
    };

    if (isLangiumPrimitive(element)) {
      return {
        label: element.toString(),
        iconPath: new vscode.ThemeIcon(
          typeIcons[typeof element] ?? "symbol-property"
        ),
      };
    }
    if (isNode(element)) {
      const isEmpty = Object.keys(element).length === 2; // `2` because of $type and $textRegion
      return {
        label: element.$type,
        description: isEmpty ? "= {}" : undefined,
        iconPath: new vscode.ThemeIcon("symbol-struct"),
        collapsibleState: isEmpty
          ? vscode.TreeItemCollapsibleState.None
          : vscode.TreeItemCollapsibleState.Collapsed,
      };
    }
    if (Array.isArray(element)) {
      // A single tree item cannot be an array of primitives
      return { label: "Error!" };
    }

    const { key, value } = element;
    if (isLangiumPrimitive(value)) {
      return {
        label: key,
        description: `= ${value}`,
        iconPath: new vscode.ThemeIcon(
          typeIcons[typeof value] ?? "symbol-property"
        ),
      };
    }
    if (Array.isArray(value)) {
      const isEmpty = value.length === 0;
      return {
        label: key,
        description: isEmpty ? "= []" : undefined,
        iconPath: new vscode.ThemeIcon("symbol-array"),
        collapsibleState: isEmpty
          ? vscode.TreeItemCollapsibleState.None
          : vscode.TreeItemCollapsibleState.Collapsed,
      };
    }

    if ("$ref" in value) {
      return {
        label: key,
        iconPath: new vscode.ThemeIcon("symbol-reference"),
        description: `Ref<${value.$refText}>`,
      };
    }

    return {
      label: key,
      iconPath: new vscode.ThemeIcon("symbol-property"),
      collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    };
  }
}
