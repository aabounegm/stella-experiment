import { URI } from "langium";
import { Connection } from "vscode-languageserver/node.js";
import { StellaServices } from "../stella-module.js";

interface SyntaxRequestParams {
  uri: string;
}

export function registerSyntaxRequest(
  connection: Connection,
  services: StellaServices
): void {
  connection.onRequest(
    "stella/syntaxTree",
    async (params: SyntaxRequestParams) => {
      console.log("Received syntax request for", params.uri);
      const doc =
        await services.shared.workspace.LangiumDocuments.getOrCreateDocument(
          URI.parse(params.uri)
        );

      const tree = doc.parseResult.value;
      return services.serializer.JsonSerializer.serialize(tree, {
        textRegions: true,
        refText: true,
      });
    }
  );
}
