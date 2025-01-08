import {
  MonacoEditorLanguageClientWrapper,
  type WrapperConfig,
} from "monaco-editor-wrapper";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import { useWorkerFactory } from "monaco-editor-wrapper/workerFactory";
import {
  BrowserMessageReader,
  BrowserMessageWriter,
} from "vscode-languageclient/browser.js";

export const configureMonacoWorkers = () => {
  // override the worker factory with your own direct definition
  useWorkerFactory({
    workerOverrides: {
      ignoreMapping: true,
      workerLoaders: {
        TextEditorWorker: () =>
          new Worker(
            new URL(
              "monaco-editor/esm/vs/editor/editor.worker.js",
              import.meta.url
            ),
            { type: "module" }
          ),
        TextMateWorker: () =>
          new Worker(
            new URL(
              "@codingame/monaco-vscode-textmate-service-override/worker",
              import.meta.url
            ),
            { type: "module" }
          ),
        editorWorkerService: () =>
          new Worker(
            new URL(
              "monaco-editor/esm/vs/editor/editor.worker.js",
              import.meta.url
            ),
            { type: "module" }
          ),
      },
    },
  });
};

const code = `language core;

extend with
  #unit-type,
  #references,
  #arithmetic-operators,
  #sequencing,
  #natural-literals;

fn helper(ref : &Nat) -> fn(Nat) -> Nat {
  return
    fn (n : Nat) {
      return
        Nat::rec(n, unit, fn(i : Nat){
          return fn(r : Unit) {
            return
              Nat::rec(*ref, unit, fn(j : Nat) {
                return fn(r2 : Unit) {
                  return ref := succ(*ref)
                }
              })
          }
        });
        (*ref)
    }
}

fn exp2(n : Nat) -> Nat {
  return helper(new(1))(n)
}

fn main(n : Nat) -> Nat {
  return exp2(n)
}
`;

export const setupConfigExtended = (): WrapperConfig => {
  const extensionFilesOrContents = new Map();
  extensionFilesOrContents.set(
    "/language-configuration.json",
    new URL("../../language-configuration.json", import.meta.url)
  );
  extensionFilesOrContents.set(
    "/stella-grammar.json",
    new URL("../../syntaxes/stella.tmLanguage.json", import.meta.url)
  );

  const worker = new Worker(
    new URL("../language/main-browser", import.meta.url),
    {
      type: "module",
      name: "Stella Language Server",
    }
  );
  const reader = new BrowserMessageReader(worker);
  const writer = new BrowserMessageWriter(worker);

  return {
    $type: "extended",
    vscodeApiConfig: {
      serviceOverrides: {
        // ...getEditorServiceOverride(useOpenEditorStub),
        ...getKeybindingsServiceOverride(),
        // ...getTextmateServiceOverride(),
        // ...getThemeServiceOverride(),
      },
      userConfiguration: {
        json: JSON.stringify({
          "workbench.colorTheme": "Default Dark Modern",
          "editor.semanticHighlighting.enabled": true,
        }),
      },
    },
    editorAppConfig: {
      codeResources: {
        modified: {
          text: code,
          uri: "main.stella",
        },
      },
      monacoWorkerFactory: configureMonacoWorkers,
      useDiffEditor: false,
    },
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
                configuration: "/language-configuration.json",
              },
            ],
            grammars: [
              {
                language: "stella",
                scopeName: "source.stella",
                path: "/stella-grammar.json",
              },
            ],
          },
        },
        filesOrContents: extensionFilesOrContents,
      },
    ],
    languageClientConfigs: {
      stella: {
        clientOptions: {
          documentSelector: ["stella"],
        },
        connection: {
          options: {
            $type: "WorkerDirect",
            worker,
          },
          messageTransports: { reader, writer },
        },
      },
    },
  };
};

export const executeExtended = async (htmlElement: HTMLElement) => {
  const userConfig = setupConfigExtended();
  const wrapper = new MonacoEditorLanguageClientWrapper();

  await wrapper.init(userConfig);
  await wrapper.start(htmlElement);

  return wrapper;
};
