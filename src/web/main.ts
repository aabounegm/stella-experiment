import { hideHeaderInIframe } from "./iframe.js";
import * as stella from "./compiler.js";

import { executeExtended } from "./setupExtended.js";
import { configureMonacoWorkers } from "./setupCommon.js";
import { KeyMod, KeyCode } from "monaco-editor";

hideHeaderInIframe();

// Initialize the Monaco editor
configureMonacoWorkers();
const monacoRoot = document.getElementById("monaco-editor-root")!;
const monacoWrapper = await executeExtended(monacoRoot);

const typecheckButton = document.getElementById(
  "typecheck"
) as HTMLButtonElement;
const compileButton = document.getElementById("compile") as HTMLButtonElement;
const resultElement = document.getElementById("result") as HTMLDivElement;

function typecheck() {
  resultElement.innerText = "Typechecking...";

  const code = monacoWrapper.getEditor()?.getValue() ?? "";
  const { result, status } = stella.typecheck(code);

  resultElement.innerText = result;
}

function compile() {
  resultElement.innerText = "Compiling...";

  const code = monacoWrapper.getEditor()?.getValue() ?? "";
  const { result, status } = stella.compile(code);

  resultElement.innerText = result;
}

// Show correct keybinding based on platform
const prefix = navigator.platform.includes("Mac") ? "⌘" : "^";
typecheckButton.innerText = `Typecheck (${prefix} + Enter)`;

// Bind the typecheck and compile functions to the buttons
monacoWrapper
  .getEditor()
  ?.addCommand(KeyMod.CtrlCmd + KeyCode.Enter, typecheck);

typecheckButton.addEventListener("click", typecheck);
compileButton.addEventListener("click", compile);

// Initial typecheck
typecheck();
