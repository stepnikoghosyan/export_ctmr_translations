import * as ts from 'typescript';
import { ModuleResolutionKind } from 'typescript';

export function compileToJS(outputDir: string, filePaths: string[], projectRootDirectory: string): void {
  console.log('output:', outputDir);
  console.log('root:', projectRootDirectory);

  const options: ts.CompilerOptions = {
    oEmitOnError: false,
    compileOnSave: false,
    experimentalDecorators: true,
    sourceMap: false,
    importHelpers: true,
    moduleResolution: ModuleResolutionKind.NodeJs,
    resolveJsonModule: true,
    esModuleInterop: true,
    emitDecoratorMetadata: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.CommonJS,
    outDir: outputDir,
    // baseUrl: projectRootDirectory,
    // paths: {
    //   "@shared/*": ["src/app/shared/*"],
    //   "@auth/*": ["src/app/modules/auth/*"],
    //   "@admin/*": ["src/app/modules/admin/*"],
    //   "@district/*": ["src/app/modules/district/*"],
    //   "@school/*": ["src/app/modules/school/*"],
    //   "@shared-pages/*": ["src/app/modules/shared-pages/modules/*"]
    // },

  };

  try {
    let program = ts.createProgram(filePaths, options);
    let emitResult = program.emit();

    // let allDiagnostics = ts
    //   .getPreEmitDiagnostics(program)
    //   .concat(emitResult.diagnostics);
    //
    // allDiagnostics.forEach(diagnostic => {
    //   if (diagnostic.file) {
    //     let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
    //     let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    //     console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    //   } else {
    //     console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    //   }
    // });
  } catch (ex) {
    console.log('ex:', ex);
  }
}
