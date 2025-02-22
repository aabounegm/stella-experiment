import { type Module, inject } from "langium";
import {
  createDefaultModule,
  createDefaultSharedModule,
  type DefaultSharedModuleContext,
  type LangiumServices,
  type LangiumSharedServices,
  type PartialLangiumServices,
} from "langium/lsp";
import {
  StellaGeneratedModule,
  StellaGeneratedSharedModule,
} from "./generated/module.js";
import {
  StellaValidator,
  registerValidationChecks,
} from "./stella-validator.js";
import { SemanticTokenProvider } from "./lsp/semantic-tokens.js";
import { CompletionProvider } from "./lsp/completion-provider.js";
import { StellaScopeProvider } from "./references/scope-provider.js";
import { StellaScopeComputation } from "./references/scope-computation.js";
import { HoverProvider } from "./lsp/hover-provider.js";
import { StellaCodeActionProvider } from "./lsp/code-action-provider.js";

/**
 * Declaration of custom services - add your own service classes here.
 */
export type StellaAddedServices = {
  validation: {
    StellaValidator: StellaValidator;
  };
};

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type StellaServices = LangiumServices & StellaAddedServices;

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const StellaModule: Module<
  StellaServices,
  PartialLangiumServices & StellaAddedServices
> = {
  validation: {
    StellaValidator: () => new StellaValidator(),
  },
  lsp: {
    SemanticTokenProvider: (services) => new SemanticTokenProvider(services),
    CompletionProvider: (services) => new CompletionProvider(services),
    HoverProvider: (services) => new HoverProvider(services),
    CodeActionProvider: (services) => new StellaCodeActionProvider(services),
  },
  references: {
    ScopeProvider: (services) => new StellaScopeProvider(services),
    ScopeComputation: (services) => new StellaScopeComputation(services),
  },
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createStellaServices(context: DefaultSharedModuleContext): {
  shared: LangiumSharedServices;
  Stella: StellaServices;
} {
  const shared = inject(
    createDefaultSharedModule(context),
    StellaGeneratedSharedModule
  );
  const Stella = inject(
    createDefaultModule({ shared }),
    StellaGeneratedModule,
    StellaModule
  );
  shared.ServiceRegistry.register(Stella);
  registerValidationChecks(Stella);
  if (!context.connection) {
    // We don't run inside a language server
    // Therefore, initialize the configuration provider instantly
    shared.workspace.ConfigurationProvider.initialized({});
  }
  return { shared, Stella };
}
