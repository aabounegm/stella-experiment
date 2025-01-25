export type Result = { status: string; result: string };

declare function stellaTypecheck_(tmp: { input: string }): void;
declare function stellaCompile_(tmp: { input: string }): void;
declare function stellaInterpret_(tmp: { code: string; input: string }): void;

export function typecheck(input: string): Result {
  const tmp = { input };
  stellaTypecheck_(tmp);
  const result: Result = tmp as unknown as Result;
  return result;
}

export function compile(input: string) {
  const tmp = { input };
  stellaCompile_(tmp);
  const result: Result = tmp as unknown as Result;
  return result;
}

export function interpret(code: string, input: string) {
  const tmp = { code, input };
  stellaInterpret_(tmp);
  const result: Result = tmp as unknown as Result;
  return result;
}
