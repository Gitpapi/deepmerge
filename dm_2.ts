type Head<T> = T extends [infer I, ...infer _Rest] ? I : never;
type Tail<T> = T extends [infer _I, ...infer Rest] ? Rest : never;

type Zip_DeepMergeTwoTypes<T, U> = T extends []
  ? U
  : U extends []
  ? T
  : [
      DeepMergeTwoTypes<Head<T>, Head<U>>,
      ...Zip_DeepMergeTwoTypes<Tail<T>, Tail<U>>
    ];

type GetObjDifferentKeys<
  T,
  U,
  T0 = Omit<T, keyof U> & Omit<U, keyof T>,
  T1 = { [K in keyof T0]: T0[K] }
> = T1;

type GetObjSameKeys<T, U> = Omit<T | U, keyof GetObjDifferentKeys<T, U>>;

type MergeTwoObjects<
  T,
  U,
  T0 = Partial<GetObjDifferentKeys<T, U>> & {
    [K in keyof GetObjSameKeys<T, U>]: DeepMergeTwoTypes<T[K], U[K]>;
  },
  T1 = { [K in keyof T0]: T0[K] }
> = T1;

export type DeepMergeTwoTypes<T, U> = [T, U] extends [any[], any[]]
  ? Zip_DeepMergeTwoTypes<T, U>
  : [T, U] extends [{ [key: string]: unknown }, { [key: string]: unknown }]
  ? MergeTwoObjects<T, U>
  : T | U;

type MergedObjects = MergeTwoObjects<
  {
    foo: [{ x: "a"; y: "b" }];
    bar: {
      bar_a: "a";
      bar_b: "b";
      bar_c: {
        cc: { ccc: { x_cccc: "x"; cccc: "_cccc" } };
      };
      bar_d: {
        dd: "dd";
      };
    };
    baz: [
      {
        b: {};
      }
    ];
  },
  {
    foo: [{ a: "a"; b: "b" }, { y: "a"; xx: "b" }, { c: "a"; b: "b" }];
    bar: {
      bar_a: {
        cc: number;
        d: "d";
      };
      bar_b: null;
      bar_c: {
        cc: { ccc: { ccccc: "4xc" } };
      };
    };
    baz: [
      {
        b: {
          a: "a";
        };
      }
    ];
  }
>;

type X = MergedObjects;
