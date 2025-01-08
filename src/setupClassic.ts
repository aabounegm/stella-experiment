import {
  MonacoEditorLanguageClientWrapper,
  UserConfig,
} from "monaco-editor-wrapper";
import { code, configureWorker, defineUserServices } from "./setupCommon.js";
import monarchSyntax from "./syntaxes/stella.monarch.js";

export const setupConfigClassic = (): UserConfig => {
  return {
    wrapperConfig: {
      serviceConfig: defineUserServices(),
      editorAppConfig: {
        $type: "classic",
        languageId: "stella",
        code,
        useDiffEditor: false,
        languageExtensionConfig: { id: "langium" },
        languageDef: monarchSyntax,
        editorOptions: {
          "semanticHighlighting.enabled": true,
          theme: "vs-dark",
        },
      },
    },
    languageClientConfig: configureWorker(),
  };
};

export const executeClassic = async (htmlElement: HTMLElement) => {
  const userConfig = setupConfigClassic();
  const wrapper = new MonacoEditorLanguageClientWrapper();
  await wrapper.initAndStart(userConfig, htmlElement);
};
