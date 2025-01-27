import { hideHeaderInIframe } from "./iframe.js";
import * as stella from "./compiler.js";

import { executeExtended } from "./setupExtended.js";
import { KeyMod, KeyCode } from "monaco-editor";

hideHeaderInIframe();

async function main() {
  // Initialize the Monaco editor
  const monacoRoot = document.getElementById("monaco-editor-root")!;
  const monacoWrapper = await executeExtended(monacoRoot);

  const typecheckButton = document.getElementById(
    "typecheck"
  ) as HTMLButtonElement;
  const compileButton = document.getElementById("compile") as HTMLButtonElement;
  const interpretButton = document.getElementById(
    "interpret"
  ) as HTMLButtonElement;
  const resultElement = document.getElementById("result") as HTMLDivElement;
  const mainInput = document.getElementById("main-input") as HTMLInputElement;

  function typecheck() {
    resultElement.innerText = "Typechecking...";

    const code = monacoWrapper.getEditor()?.getValue() ?? "";
    const { result, status: _ } = stella.typecheck(code);

    // TODO: use status to color the result
    resultElement.innerText = result;
  }

  function compile() {
    resultElement.innerText = "Compiling...";

    const code = monacoWrapper.getEditor()?.getValue() ?? "";
    const { result, status: _ } = stella.compile(code);

    // TODO: use status to color the result
    resultElement.innerText = result;
  }

  function interpret() {
    resultElement.innerText = "Evaluating...";

    const code = monacoWrapper.getEditor()?.getValue() ?? "";
    const input = mainInput.value;

    if (input === "") {
      resultElement.innerText = "No input provided.";
      return;
    }

    const { result, status: _ } = stella.interpret(code, input);

    // TODO: use status to color the result
    resultElement.innerText = result;
  }

  mainInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      interpret();
    }
  });

  // Show correct keybinding based on platform
  const prefix = navigator.platform.includes("Mac") ? "⌘" : "^";
  typecheckButton.innerText = `Typecheck (${prefix} + Enter)`;

  // Bind the typecheck and compile functions to the buttons
  monacoWrapper
    .getEditor()
    ?.addCommand(KeyMod.CtrlCmd + KeyCode.Enter, typecheck);

  typecheckButton.addEventListener("click", typecheck);
  compileButton.addEventListener("click", compile);
  interpretButton.addEventListener("click", interpret);

  // Initial typecheck
  typecheck();
}

main();
