grammar Stella

entry Program:
    LanguageDecl
    extensions+=Extension*
    decls+=Decl*
;

LanguageDecl:
    {infer LanguageDecl}
    'language' 'core' ';'
;

Extension:
    'extend' 'with'
    extensionNames+=EXTENSION_NAME (',' extensionNames+=EXTENSION_NAME)* ';'
;

// Declarations

Decl:
    DeclFun
    | DeclFunGeneric
    | DeclTypeAlias
    | DeclExceptionType
    | DeclExceptionVariant
;

Annotation:
    InlineAnnotation;
InlineAnnotation:
    {infer InlineAnnotation} 'inline';

ParamDecl:
    name=ID ':' paramType=Type;

fragment FuncParamsAndBody:
    '(' (paramDecls+=ParamDecl (',' paramDecls+=ParamDecl)*)? ')'
    ('->' returnType=Type)?
    ('throws' throwTypes+=Type (',' throwTypes+=Type)*)?
    '{' (localDecls+=Decl)* 'return' returnExpr=Expr '}'
;

DeclFun:
    (annotations+=Annotation)* 'fn' name=ID FuncParamsAndBody
;

DeclFunGeneric:
    (annotations+=Annotation)* 'generic' 'fn' name=ID '[' generics+=ID (',' generics+=ID)* ']' FuncParamsAndBody
;

DeclTypeAlias:
    'type' name=ID '=' type=Type;

DeclExceptionType:
    'exception' 'type' '=' exceptionType=Type;

DeclExceptionVariant:
    'exception' 'variant' name=ID ':' variantType=Type;


// Expressions

DotRecord:
    expr=Expr '.' label=ID;
DotTuple:
    expr=Expr '.' index=INT;
ConstTrue:
    {infer ConstTrue} 'true';
ConstFalse:
    {infer ConstFalse} 'false';
ConstUnit:
    {infer ConstUnit} 'unit';
ConstInt:
    n=INT;
ConstMemory:
    mem=MEMORY_ADDRESS;
Var:
    name=ID;
Panic:
    {infer Panic} 'panic!';
Throw:
    'throw' '(' expr=Expr ')';
TryCatch:
    'try' '{' tryExpr=Expr '}' 'catch' '{' pat=Pattern '=>' fallbackExpr=Expr '}';
TryWith:
    'try' '{' tryExpr=Expr '}' 'with' '{' fallbackExpr=Expr '}';
Inl:
    'inl' '(' expr=Expr ')';
Inr:
    'inr' '(' expr=Expr ')';
ConsList:
    'cons' '(' head=Expr ',' tail=Expr ')';
Head:
    'List::head' '(' list=Expr ')';
IsEmpty:
    'List::isempty' '(' list=Expr ')';
Tail:
    'List::tail' '(' list=Expr ')';
Succ:
    'succ' '(' n=Expr ')';
LogicNot:
    'not' '(' expr=Expr ')';
Pred:
    'Nat::pred' '(' n=Expr ')';
IsZero:
    'Nat::iszero' '(' n=Expr ')';
Fix:
    'fix' '(' expr=Expr ')';
NatRec:
    'Nat::rec' '(' n=Expr ',' initial=Expr ',' step=Expr ')';
Fold:
    'fold' '[' type=Type ']' expr=Expr;
Unfold:
    'unfold' '[' type=Type ']' expr=Expr;
Application:
    fun=Expr '(' (args+=Expr (',' args+=Expr)*)? ')';
TypeApplication:
    fun=Expr '[' (types+=Type (',' types+=Type)*) ']';
Multiply:
    left=Expr '*' right=Expr;
Divide:
    left=Expr '/' right=Expr;
LogicAnd:
    left=Expr 'and' right=Expr;
Ref:
    'new' expr=Expr;
Deref:
    '*' expr=Expr;
Add:
    left=Expr '+' right=Expr;
Subtract:
    left=Expr '-' right=Expr;
LogicOr:
    left=Expr 'or' right=Expr;
TypeAsc:
    expr=Expr 'as' type=Type;
TypeCast:
    expr=Expr 'cast' 'as' type=Type;
Tuple:
    '{' (exprs+=Expr (',' exprs+=Expr)*)? '}';
Record:
    '{' bindings+=Binding (',' bindings+=Binding)* '}';
Variant:
    '<|' label=ID ('=' rhs=Expr)? '|>';
Match:
    'match' expr=Expr '{' (cases+=MatchCase ('|' cases+=MatchCase)*)? '}';
List:
    '[' (exprs+=Expr (',' exprs+=Expr)*)? ']';
LessThan:
    left=Expr '<' right=Expr;
LessThanOrEqual:
    left=Expr '<=' right=Expr;
GreaterThan:
    left=Expr '>' right=Expr;
GreaterThanOrEqual:
    left=Expr '>=' right=Expr;
Equal:
    left=Expr '==' right=Expr;
NotEqual:
    left=Expr '!=' right=Expr;
Assign:
    lhs=Expr ':=' rhs=Expr;
If:
    'if' condition=Expr 'then' thenExpr=Expr 'else' elseExpr=Expr;
Sequence:
    expr1=Expr ';' expr2=Expr;
Let:
    'let' patternBindings+=PatternBinding (',' patternBindings+=PatternBinding)* 'in' body=Expr;
LetRec:
    'letrec' patternBindings+=PatternBinding (',' patternBindings+=PatternBinding)* 'in' body=Expr;
TypeAbstraction:
    'generic' '[' generics+=ID (',' generics+=ID)* ']' expr=Expr;
ParenthesisedExpr:
    '(' expr=Expr ')';

Expr:
    (DotRecord
    | DotTuple
    | ConstTrue
    | ConstFalse
    | ConstUnit
    | ConstInt
    | ConstMemory
    | Var
    | Panic
    | Throw
    | TryCatch
    | TryWith
    | Inl
    | Inr
    | ConsList
    | Head
    | IsEmpty
    | Tail
    | Succ
    | LogicNot
    | Pred
    | IsZero
    | Fix
    | NatRec
    | Fold
    | Unfold
    | Application
    | TypeApplication
    | Multiply
    | Divide
    | LogicAnd
    | Ref
    | Deref
    | Add
    | Subtract
    | LogicOr
    | TypeAsc
    | TypeCast
    | Tuple
    | Record
    | Variant
    | Match
    | List
    | LessThan
    | LessThanOrEqual
    | GreaterThan
    | GreaterThanOrEqual
    | Equal
    | NotEqual
    | Assign
    | If
    | Sequence
    | Let
    | LetRec
    | TypeAbstraction
    | ParenthesisedExpr) ';'?
;

// Patterns

PatternBinding:
    pattern=Pattern '=' rhs=Expr;

Binding:
    name=ID '=' rhs=Expr;

MatchCase:
    pattern=Pattern '=>' expr=Expr;

PatternVariant:
    '<|' label=ID ('=' pattern=Pattern)? '|>';
PatternInl:
    'inl' '(' pattern=Pattern ')';
PatternInr:
    'inr' '(' pattern=Pattern ')';
PatternTuple:
    '{' (patterns+=Pattern (',' patterns+=Pattern)*)? '}';
PatternRecord:
    '{' (patterns+=LabelledPattern (',' patterns+=LabelledPattern)*)? '}';
PatternList:
    '[' (patterns+=Pattern (',' patterns+=Pattern)*)? ']';
PatternCons:
    'cons' '(' head=Pattern ',' tail=Pattern ')';
PatternFalse:
    {infer PatternFalse} 'false';
PatternTrue:
    {infer PatternTrue} 'true';
PatternUnit:
    {infer PatternUnit} 'unit';
PatternInt:
    n=INT;
PatternSucc:
    'succ' '(' pattern=Pattern ')';
PatternVar:
    name=ID;
PatternAsc:
    pattern=Pattern 'as' type=Type;
PatternCastAs:
    pattern=Pattern 'cast' 'as' type=Type;
ParenthesisedPattern:
    '(' pattern=Pattern ')';

Pattern:
    PatternVariant
    | PatternInl
    | PatternInr
    | PatternTuple
    | PatternRecord
    | PatternList
    | PatternCons
    | PatternFalse
    | PatternTrue
    | PatternUnit
    | PatternInt
    | PatternSucc
    | PatternVar
    | PatternAsc
    | PatternCastAs
    | ParenthesisedPattern;

LabelledPattern:
    label=ID '=' pattern=Pattern;

// Types

TypeBool:
    {infer TypeBool} 'Bool';
TypeNat:
    {infer TypeNat} 'Nat';
TypeRef:
    '&' type=Type;
TypeSum:
    left=Type '+' right=Type;
TypeFun:
    'fn' '(' (paramTypes+=Type (',' paramTypes+=Type)*)? ')' '->' returnType=Type;
TypeForAll:
    'forall' (types+=ID)* '.' type=Type;
TypeRec:
    'µ' var=ID '.' type=Type;
TypeTuple:
    '{' (types+=Type (',' types+=Type)*)? '}';
TypeRecord:
    '{' fieldTypes+=RecordFieldType (',' fieldTypes+=RecordFieldType)* '}';
TypeVariant:
    '<|' (fieldTypes+=VariantFieldType (',' fieldTypes+=VariantFieldType)*)? '|>';
TypeList:
    '[' type=Type ']';
TypeUnit:
    {infer TypeUnit} 'Unit';
TypeTop:
    {infer TypeTop} 'Top';
TypeBottom:
    {infer TypeBottom} 'Bot';
TypeAuto:
    {infer TypeAuto} 'auto';
TypeVar:
    name=ID;
TypeParens:
    '(' type=Type ')';

Type:
    TypeBool
    | TypeNat
    | TypeRef
    | TypeSum
    | TypeFun
    | TypeForAll
    | TypeRec
    | TypeTuple
    | TypeRecord
    | TypeVariant
    | TypeList
    | TypeUnit
    | TypeTop
    | TypeBottom
    | TypeAuto
    | TypeVar
    | TypeParens;

RecordFieldType:
    label=ID ':' type=Type;
VariantFieldType:
    label=ID (':' type=Type)?;

hidden terminal WS: /\s+/;
terminal ID: /[_a-zA-Z][!\-:?\w]*/;
terminal EXTENSION_NAME: /#[-\w]+/;
terminal MEMORY_ADDRESS: /<0x[\da-fA-F]+>/;
terminal INT returns number: /[0-9]+/;
terminal STRING: /"(\\.|[^"\\])*"/;

hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;
