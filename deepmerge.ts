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

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();

  const allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start!
      );
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      );
    }
  });

  const exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

function main(): void {
  fs.mkdirSync('./dev-out',{recursive:true})
  cp.execSync('cp -r ./testlib-js ./dev-out/');

  const tscfgFilenames = [
    '@tsconfig/node14/tsconfig.json',
    path.join(process.cwd(), 'tsconfig.base.json'),
    path.join(process.cwd(), 'tsconfig.json'),
  ];
  const tscfg = tscfgFilenames.map((fn) => require(fn).compilerOptions);
  const compilerOptions: ts.CompilerOptions = dm.deepMerge(
    dm.deepMergeInnerDedupeArrays,
    ...tscfg
  );

  if (compilerOptions.lib && compilerOptions.lib.length)
    compilerOptions.lib = compilerOptions.lib.map((s) => 'lib.' + s + '.d.ts');
  console.log(JSON.stringify(compilerOptions, null, 2));
  compile(process.argv.slice(2), compilerOptions);
}
