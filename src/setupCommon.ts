import getEditorServiceOverride from "@codingame/monaco-vscode-editor-service-override";
import getKeybindingsServiceOverride from "@codingame/monaco-vscode-keybindings-service-override";
import { LanguageClientConfig } from "monaco-editor-wrapper";
import { useOpenEditorStub } from "monaco-editor-wrapper/vscode/services";
import { useWorkerFactory } from "monaco-editor-wrapper/workerFactory";

export const defineUserServices = () => {
  return {
    userServices: {
      ...getEditorServiceOverride(useOpenEditorStub),
      ...getKeybindingsServiceOverride(),
    },
    debugLogging: true,
  };
};

export const configureMonacoWorkers = () => {
  // override the worker factory with your own direct definition
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(
          new URL(
            "monaco-editor/esm/vs/editor/editor.worker.js",
            import.meta.url
          ),
          { type: "module" }
        ),
    },
  });
};

export const configureWorker = (): LanguageClientConfig => {
  // vite does not extract the worker properly if it is URL is a variable
  const lsWorker = new Worker(
    new URL("./language/main-browser", import.meta.url),
    {
      type: "module",
      name: "Stella Language Server",
    }
  );

  return {
    options: {
      $type: "WorkerDirect",
      worker: lsWorker,
    },
  };
};

export const code = `language core;

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
