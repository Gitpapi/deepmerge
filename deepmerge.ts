type IsObject<T> = T extends object ? T extends any[] ? false : true : false;

function isObject<T>(v: T): IsObject<T> {
  return (typeof v === 'object' && !Array.isArray(v)) as IsObject<T>;
}

type Merge2<T, U> = IsObject<T> & IsObject<U> extends true ? {
  [K in keyof T]: K extends keyof U ? Merge2<T[K], U[K]> : T[K];
} & U : U;

function merge2<T, U>(a: T, b: U): Merge2<T, U> {
  return (
    isObject(a) && isObject(b)
      ? Object.assign({}, a, Object.fromEntries(Object.entries(b).map(([k, v]) => [k, merge2((a as any)[k], v)])))
      : b
  ) as Merge2<T, U>;
}

// Map assign. - Montana

export type Merge<T extends unknown[]> = {
    0: T[0],
    1: T extends [infer Car, ...infer Cdr] ? Merge2<Car, Merge<Cdr>> : T,
}[T extends [unknown, unknown, ...unknown[]] ? 1 : 0];

export function merge<T extends unknown[]>(...objs: T): Merge<T> {
  if (objs.length < 2) return objs[0];
  return merge2(objs[0], merge(...objs.slice(1)));
}
