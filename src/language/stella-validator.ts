import type { ValidationChecks } from "langium";
import type { StellaAstType } from "./generated/ast.js";
import type { StellaServices } from "./stella-module.js";

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: StellaServices) {
  const registry = services.validation.ValidationRegistry;
  const validator = services.validation.StellaValidator;
  const checks: ValidationChecks<StellaAstType> = {
    // Person: validator.checkPersonStartsWithCapital
  };
  registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class StellaValidator {
  // checkPersonStartsWithCapital(person: Person, accept: ValidationAcceptor): void {
  //     if (person.name) {
  //         const firstChar = person.name.substring(0, 1);
  //         if (firstChar.toUpperCase() !== firstChar) {
  //             accept('warning', 'Person name should start with a capital.', { node: person, property: 'name' });
  //         }
  //     }
  // }
}
