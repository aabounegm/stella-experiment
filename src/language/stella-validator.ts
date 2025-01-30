import { type ValidationAcceptor, type ValidationChecks } from "langium";
import type { Range } from "vscode-languageserver";
import {
  isDeclFun,
  type Program,
  type StellaAstType,
} from "./generated/ast.js";
import type { StellaServices } from "./stella-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: StellaServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.StellaValidator;
  const checks: ValidationChecks<StellaAstType> = {
    Program: [validator.checkHasMain, validator.checkUniqueFunctionNames],
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class StellaValidator {
  checkHasMain(program: Program, accept: ValidationAcceptor): void {
    if (!program.decls.filter(isDeclFun).some((decl) => decl.name === "main")) {
      accept("error", "Missing main function", {
        node: program,
        property: "langDecl", // To not highlight the whole program
        code: "ERROR_MISSING_MAIN",
      });
    }
  }

  checkUniqueFunctionNames(program: Program, accept: ValidationAcceptor): void {
    const usedNames = new Map<string, Range | undefined>();

    for (const decl of program.decls) {
      if (isDeclFun(decl)) {
        if (usedNames.has(decl.name)) {
          const range = usedNames.get(decl.name);
          accept("error", `Function '${decl.name}' is already defined`, {
            node: decl,
            property: "name",
            relatedInformation: range
              ? [
                  {
                    location: {
                      uri: program.$document!.textDocument.uri,
                      range,
                    },
                    message: "Originally defined here",
                  },
                ]
              : [],
          });
        } else {
          usedNames.set(decl.name, decl.$cstNode?.range);
        }
      }
    }
  }
}
