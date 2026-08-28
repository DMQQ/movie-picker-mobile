export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function allSettled<T>(
  settled: Promise<PromiseSettledResult<T>[]>,
): Promise<(T | undefined)[]>;
export async function allSettled<T, D>(
  settled: Promise<PromiseSettledResult<T>[]>,
  defaultValue: D,
): Promise<(T | D)[]>;
export async function allSettled<T, D>(
  settled: Promise<PromiseSettledResult<T>[]>,
  defaultValue?: D,
): Promise<(T | D | undefined)[]> {
  const results = await settled;
  return results.map((r) =>
    r.status === "fulfilled" ? r.value : (defaultValue as D | undefined),
  );
}
