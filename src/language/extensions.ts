import { Program } from "./generated/ast.js";

/** All the extensions recognized by Stella */
export enum Extensions {
  UniversalTypes = "#universal-types",
  ExceptionTypeDeclaration = "#exception-type-declaration",
  OpenVariantExceptions = "#open-variant-exceptions",
  NestedFunctionDeclarations = "#nested-function-declarations",
  InlineFunctions = "#inline-functions",
  MultiparameterFunctions = "#multiparameter-functions",
  NullaryFunctions = "#nullary-functions",
  NoReturnTypeAsUnit = "#no-return-type-as-unit",
  NoReturnTypeAsAuto = "#no-return-type-as-auto",
  ThrowTypeAnnotations = "#throw-type-annotations",
  PatternAscriptions = "#pattern-ascriptions",
  TypeCastPatterns = "#type-cast-patterns",
  SumTypes = "#sum-types",
  StructuralPatterns = "#structural-patterns",
  Variants = "#variants",
  NullaryVariantLabels = "#nullary-variant-labels",
  Tuples = "#tuples",
  Pairs = "#pairs",
  Records = "#records",
  Lists = "#lists",
  Integers = "#integers",
  UnitType = "#unit-type",
  NaturalLiterals = "#natural-literals",
  Sequencing = "#sequencing",
  LetBindings = "#let-bindings",
  LetManyBindings = "#let-many-bindings",
  LetPatterns = "#let-patterns",
  LetrecBindings = "#letrec-bindings",
  LetrecManyBindings = "#letrec-many-bindings",
  TypeAscriptions = "#type-ascriptions",
  ArithmeticOperators = "#arithmetic-operators",
  Predecessor = "#predecessor",
  FixpointCombinator = "#fixpoint-combinator",
  GeneralRecursion = "#general-recursion",
  IsorecursiveTypes = "#isorecursive-types",
  LogicalOperators = "#logical-operators",
  ComparisonOperators = "#comparison-operators",
  References = "#references",
  TypeCast = "#type-cast",
  Panic = "#panic",
  Exceptions = "#exceptions",
  TryCastAs = "#try-cast-as",
  TypeReconstruction = "#type-reconstruction",
  RecursiveTypes = "#recursive-types",
  EquirecursiveTypes = "#equirecursive-types",
  TypeAliases = "#type-aliases",
  TopType = "#top-type",
  BottomType = "#bottom-type",
  StructuralSubtyping = "#structural-subtyping",
  AmbiguousTypeAsBottom = "#ambiguous-type-as-bottom",
}

export const extensionValues = new Set<string>(Object.values(Extensions));

export function getExtensions(program: Program): Set<string> {
  // TODO: cache by program.$document!.textDocument.version
  return new Set(
    program.extensions.flatMap((extension) => extension.extensionNames)
  );
}

export function isRecognizedExtension(
  extensionName: string
): extensionName is Extensions {
  return extensionValues.has(extensionName);
}

/** Links to the documentation for each extension */
export const extensionDocLinks: Record<Extensions, string> = {
  // Syntax and derived forms
  [Extensions.StructuralPatterns]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#structural-patterns",
  [Extensions.LetBindings]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#let-bindings",
  [Extensions.NestedFunctionDeclarations]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#nested-function-declarations",
  [Extensions.NaturalLiterals]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#natural-literals",
  [Extensions.ArithmeticOperators]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#arithmetic-operators",
  [Extensions.ComparisonOperators]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#comparison-operators",
  [Extensions.NullaryFunctions]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#nullary-functions",
  [Extensions.MultiparameterFunctions]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#multiparameter-functions",
  [Extensions.Sequencing]:
    "https://fizruk.github.io/stella/site/extensions/syntax/#sequencing",

  // Simple types
  [Extensions.TypeAscriptions]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#type-ascriptions",
  [Extensions.TypeAliases]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#type-alises",
  [Extensions.UnitType]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#unit-type",
  [Extensions.Pairs]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#pairs",
  [Extensions.Tuples]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#tuples",
  [Extensions.Records]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#records",
  [Extensions.SumTypes]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#sum-types",
  [Extensions.Variants]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#variants",
  [Extensions.Lists]:
    "https://fizruk.github.io/stella/site/extensions/simple-types/#lists",

  // References
  [Extensions.References]:
    "https://fizruk.github.io/stella/site/extensions/references/",

  // Exceptions
  [Extensions.ExceptionTypeDeclaration]:
    "https://fizruk.github.io/stella/site/extensions/exceptions/#declaring-exception-type",
  [Extensions.OpenVariantExceptions]:
    "https://fizruk.github.io/stella/site/extensions/exceptions/#open-variant-exceptions",
  [Extensions.Exceptions]:
    "https://fizruk.github.io/stella/site/extensions/exceptions/#throwing-exceptions",
  [Extensions.Panic]:
    "https://fizruk.github.io/stella/site/extensions/exceptions/#panic",

  // Pattern matching

  // Subtyping
  [Extensions.StructuralSubtyping]:
    "https://fizruk.github.io/stella/site/extensions/subtyping/#structural-subtyping",
  [Extensions.TopType]:
    "https://fizruk.github.io/stella/site/extensions/subtyping/#top-type",
  [Extensions.BottomType]:
    "https://fizruk.github.io/stella/site/extensions/subtyping/#bottom-type",

  // Universal types
  [Extensions.UniversalTypes]:
    "https://fizruk.github.io/stella/site/extensions/universal-types",

  // Undocumented...
  [Extensions.InlineFunctions]: "",
  [Extensions.NoReturnTypeAsUnit]: "",
  [Extensions.NoReturnTypeAsAuto]: "",
  [Extensions.ThrowTypeAnnotations]: "",
  [Extensions.PatternAscriptions]: "",
  [Extensions.TypeCastPatterns]: "",
  [Extensions.NullaryVariantLabels]: "",
  [Extensions.Integers]: "",
  [Extensions.LetManyBindings]: "",
  [Extensions.LetPatterns]: "",
  [Extensions.LetrecBindings]: "",
  [Extensions.LetrecManyBindings]: "",
  [Extensions.Predecessor]: "",
  [Extensions.FixpointCombinator]: "",
  [Extensions.GeneralRecursion]: "",
  [Extensions.IsorecursiveTypes]: "",
  [Extensions.LogicalOperators]: "",
  [Extensions.TypeCast]: "",
  [Extensions.TryCastAs]: "",
  [Extensions.TypeReconstruction]: "",
  [Extensions.RecursiveTypes]: "",
  [Extensions.EquirecursiveTypes]: "",
  [Extensions.AmbiguousTypeAsBottom]: "",
};
