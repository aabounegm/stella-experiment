export function levenshtein(a: string, b: string): number {
  const dp: number[] = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j++) {
    dp[j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;

    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = temp;
    }
  }

  return dp[b.length];
}
