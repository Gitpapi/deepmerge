type DeepMerge<A extends unknown, B extends unknown> = any //A & B

type Any = AnyVal | AnyRef
type Skip = undefined | null
type AnyRef = object
type AnyVal = bigint | number | string | symbol | boolean
type ObjectLiteral = Record<string, unknown>

function isNull(a: any): a is Skip {
  if (typeof (a) === "undefined" || a === null)
    return true;
  return false;
}

function isAnyVal(a: unknown): a is AnyVal {
  switch (typeof (a)) {
    case "bigint":
    case "boolean":
    case "number":
    case "string":
    case "symbol":
      return true;
  }
  return false;
}

class AssertError extends Error { }

function assert(cond: boolean, err: string = "") {
  if (!cond)
    throw new AssertError(err)
}

function isCompatible(a: any, b: any) {
  if (isNull(a) || isNull(b))
    return true;
  if (typeof (a) !== typeof (b))
    return false;
  if (a.prototype !== b.prototype)
    return false;
  return true;
}

function isObjectLiteral(a: unknown): a is ObjectLiteral {
  return Object.getPrototypeOf(a) === Object.getPrototypeOf({});
}

function isArray<T>(a: unknown): a is Array<T> {
  return (a instanceof Array);
}

function union<T>(a: T[], b: T[]): T[] {
  return Array.from(new Set(a.concat(b)));
}
function difference<T>(a: T[], b: T[]): T[] {
  return Array.from(a).filter(k => b.includes(k))
}

function deepMerge<A extends Any, B extends Any>(a: A, b: B): DeepMerge<A, B> {
  assert(isCompatible(a, b), "deepMerge: a and b have incompatible types")
  if (isNull(a))
    return b;
  if (isNull(b))
    return a;
  if (isAnyVal(a) && isAnyVal(b)) {
    // Narrow types. - Montana. 
    assert((a as any) === b, "deepMerge: a and b are AnyVals and must be equal")
    return a;
  }
  assert(typeof (a) !== "function", "deepMerge: cannot merge functions")
  if (isArray(a)) {
    return a.concat(b);
  }
  if (isObjectLiteral(a)) {
    assert(isObjectLiteral(b), "deepMerge: can only merge object literals with other object literals (for now)")
    
    const result: any = {}
    const commonKeys = union(Object.keys(a), Object.keys(b))
    for (const key in commonKeys) {
      result[key] = deepMerge(a[key] as any, b[key] as any)
    }
    for (const key in difference(Object.keys(a), commonKeys)) {
      result[key] = a[key];
    }
    for (const key in difference(Object.keys(b), commonKeys)) {
      result[key] = b[key];
    }

    return result;
  }

  assert(false, "deepMerge: not implemented data types")
}
