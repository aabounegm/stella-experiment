import {
  MonacoEditorLanguageClientWrapper,
  UserConfig,
} from "monaco-editor-wrapper";
import { code, configureWorker, defineUserServices } from "./setupCommon.js";

export const setupConfigExtended = (): UserConfig => {
  const extensionFilesOrContents = new Map();
  extensionFilesOrContents.set(
    "/language-configuration.json",
    new URL("../../language-configuration.json", import.meta.url)
  );
  extensionFilesOrContents.set(
    "/stella-grammar.json",
    new URL("../../syntaxes/stella.tmLanguage.json", import.meta.url)
  );

  return {
    wrapperConfig: {
      serviceConfig: defineUserServices(),
      editorAppConfig: {
        $type: "extended",
        languageId: "stella",
        code,
        useDiffEditor: false,
        extensions: [
          {
            config: {
              name: "stella-web",
              publisher: "generator-langium",
              version: "1.0.0",
              engines: {
                vscode: "*",
              },
              contributes: {
                languages: [
                  {
                    id: "stella",
                    extensions: [".stella"],
                    configuration: "./language-configuration.json",
                  },
                ],
                grammars: [
                  {
                    language: "stella",
                    scopeName: "source.stella",
                    path: "./stella-grammar.json",
                  },
                ],
              },
            },
            filesOrContents: extensionFilesOrContents,
          },
        ],
        userConfiguration: {
          json: JSON.stringify({
            "workbench.colorTheme": "Default Dark Modern",
            "editor.semanticHighlighting.enabled": true,
          }),
        },
      },
    },
    languageClientConfig: configureWorker(),
  };
};

export const executeExtended = async (htmlElement: HTMLElement) => {
  const userConfig = setupConfigExtended();
  const wrapper = new MonacoEditorLanguageClientWrapper();
  await wrapper.initAndStart(userConfig, htmlElement);
  return wrapper;
};
