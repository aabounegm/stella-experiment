import { AstNode, Module } from "langium";
import { LangiumSharedServices } from "langium/lsp";
import {
  TypirServices,
  NO_PARAMETER_NAME,
  InferenceRuleNotApplicable,
} from "typir";
import {
  AbstractLangiumTypeCreator,
  LangiumServicesForTypirBinding,
  PartialTypirLangiumServices,
} from "typir-langium";
import {
  isApplication,
  isConstFalse,
  isConstInt,
  isConstTrue,
  isDeclFun,
  isDeclFunGeneric,
  isIf,
  isIsZero,
  isParamDecl,
  isSucc,
  isTypeAuto,
  isTypeBottom,
  isTypeTop,
  isTypeUnit,
  isVar,
  Var,
} from "../generated/ast.js";

export class StellaTypeCreator extends AbstractLangiumTypeCreator {
  protected readonly typir: TypirServices;

  constructor(
    typirServices: TypirServices,
    langiumServices: LangiumSharedServices
  ) {
    super(typirServices, langiumServices);
    this.typir = typirServices;

    // this.classKind = new ClassKind(this.typir, {
    //   typing: "Structural",
    //   // subtypeFieldChecking: 'ASSIGNABLE_TYPE', // TODO: change based on enabled extension
    // });
  }

  onInitialize(): void {
    // Register primitive types
    const typeNat = this.typir.factory.Primitives.create({
      primitiveName: "Natural", // The name here doesn't have to correspond to the name in the grammar, what matters is the inference rule
      inferenceRules: [isConstInt],
    });

    const typeBool = this.typir.factory.Primitives.create({
      primitiveName: "Boolean",
      inferenceRules: [isConstTrue, isConstFalse],
    });

    // @ts-ignore
    const typeUnit = this.typir.factory.Primitives.create({
      primitiveName: "Unit",
      inferenceRules: isTypeUnit,
    });

    // TODO: is auto really a "primitive" type?
    // @ts-ignore
    const typeAuto = this.typir.factory.Primitives.create({
      primitiveName: "Auto",
      inferenceRules: isTypeAuto,
    });

    // Top and bottom
    const typeTop = this.typir.factory.Top.create({
      inferenceRules: isTypeTop,
    });
    // @ts-ignore
    const typeBottom = this.typir.factory.Bottom.create({
      inferenceRules: isTypeBottom,
    });

    // Unary operators
    // TODO: also needs generics
    // this.typir.factory.Operators.createUnary({
    //   name: "Dereference",
    //   inferenceRule: {
    //     filter: isDeref,
    //     matching: () => true,
    //     operand: (deref) => deref.expr,
    //   },
    // });

    // Binary operators
    this.typir.factory.Operators.createBinary;

    // Ternary operators
    this.typir.factory.Operators.createTernary({
      name: "If-then-else",
      inferenceRule: {
        filter: isIf,
        matching: () => true, // Not sure what that does, tbh
        operands: (node) => [node.condition, node.thenExpr, node.elseExpr],
      },
      signature: {
        first: typeBool,
        second: typeTop, // TODO: generics are not yet supported in Typir :(
        third: typeTop,
        return: typeTop,
      },
    });

    // Built-in functions
    this.typir.factory.Functions.create({
      functionName: "succ",
      inputParameters: [{ name: "n", type: typeNat }],
      outputParameter: {
        name: NO_PARAMETER_NAME,
        type: typeNat,
      },
      inferenceRuleForCalls: {
        filter: isSucc,
        matching: () => true,
        inputArguments: (node) => [node.n],
      },
    });
    this.typir.factory.Functions.create({
      functionName: "Nat::iszero",
      inputParameters: [{ name: "n", type: typeNat }],
      outputParameter: {
        name: NO_PARAMETER_NAME,
        type: typeBool,
      },
      inferenceRuleForCalls: {
        filter: isIsZero,
        matching: (node) => true,
        inputArguments: (node) => [node.n],
      },
    });

    // TODO: "List::" functions (and the type itself) depend on Typir adding generics

    // Inference rules
    this.typir.Inference.addInferenceRule((node, typir) => {
      // Vars
      if (isVar(node)) {
        // The type of a variable is the type of the declaration it points to
        return node.ref.ref;
      }

      // TODO: Function declarations
      if (isDeclFun(node)) {
      } else if (isDeclFunGeneric(node)) {
      }

      // TODO: Functions calls
      if (isApplication(node)) {
        if (isVar(node.fun)) {
          // return (node.fun.ref.ref as DeclFun).returnType;
        }
      }

      // Function parameters
      if (isParamDecl(node)) {
        return node.paramType;
      }

      // TODO: patterns

      return InferenceRuleNotApplicable;
    });

    // Additional validations
    // Return of a function must match the declared return type
    this.typir.validation.Collector.addValidationRule((node, typir) => {
      if (isDeclFun(node)) {
        return typir.validation.Constraints.ensureNodeIsAssignable(
          node.returnExpr,
          node.returnType,
          (actual, expected) => ({
            message: `The return type of function ${node.name} is ${actual.userRepresentation}, but the declared return type is ${expected.userRepresentation}`,
          })
        );
      }
      return [];
    });
  }

  onNewAstNode(node: AstNode): void {
    if (isDeclFun(node)) {
      this.typir.factory.Functions.create({
        functionName: node.name,
        inputParameters: node.paramDecls.map((decl) => ({
          name: decl.name,
          type: decl.paramType,
        })),
        outputParameter: {
          name: NO_PARAMETER_NAME,
          type: node.returnType,
        },
        inferenceRuleForDeclaration: (otherNode) => otherNode === node, // only the current function/method declaration matches
        inferenceRuleForCalls: {
          filter: isApplication,
          matching: (application) => {
            return (application.fun as Var)?.ref?.ref === node; // TODO: check what any expression evaluates to
          },
          inputArguments: (application) => application.args,
        },
        associatedLanguageNode: node,
      });
    }
  }
}

export function createStellaTypirModule(
  langiumServices: LangiumSharedServices
): Module<LangiumServicesForTypirBinding, PartialTypirLangiumServices> {
  return {
    TypeCreator: (typirServices) =>
      new StellaTypeCreator(typirServices, langiumServices),
  };
}
