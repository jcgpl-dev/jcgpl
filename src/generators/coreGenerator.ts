import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function generateCore(targetUri?: vscode.Uri) {
  let rootPath: string | undefined;

  if (targetUri && targetUri.fsPath) {
    rootPath = targetUri.fsPath;
  } else {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {
      vscode.window.showErrorMessage('No workspace opened. Please open a Flutter project.');
      return;
    }
    rootPath = path.join(workspace.uri.fsPath, 'lib');
  }

  // Ensure we are dropping inside a direct root directory or lib root
  const baseCorePath = rootPath.endsWith('lib') ? path.join(rootPath, 'core') : path.join(rootPath, 'core');

  const directories = [
    'error',
    'network',
    'usecases',
    'constants', 
    'presentation/widgets',
    'utils'
  ];

  try {
    // 1. Build Layer Directories
    directories.forEach(dir => {
      fs.mkdirSync(path.join(baseCorePath, dir), { recursive: true });
    });

    // 2. Scaffold Abstract Global UseCase Interface
    fs.writeFileSync(
      path.join(baseCorePath, 'usecases', 'usecase.dart'),
      `import 'package:dartz/dartz.dart';\nimport '../error/failures.dart';\n\nabstract class UseCase<Type, Params> {\n  Future<Either<Failure, Type>> call(Params params);\n}\n\nclass NoParams {}\n`
    );

    // 3. Scaffold Global Errors & Failures Architecture
    fs.writeFileSync(
      path.join(baseCorePath, 'error', 'failures.dart'),
      `abstract class Failure {\n  final String message;\n  const Failure([this.message = 'An unexpected error occurred.']);\n}\n\nclass ServerFailure extends Failure {\n  const ServerFailure([super.message = 'Server connection failed.']);\n}\n\nclass CacheFailure extends Failure {\n  const CacheFailure([super.message = 'Local cache data operation failed.']);\n}\n`
    );


    // 5. Scaffold Global Dependency Injection Initializer Stubs
    const libPath = path.dirname(baseCorePath);
    fs.writeFileSync(
      path.join(libPath, 'injection_container.dart'),
      `import 'package:get_it/get_it.dart';\n\nfinal sl = GetIt.instance;\n\nFuture<void> init() async {\n  //! Features - [Register your feature blocks here]\n\n  //! Core\n\n  //! External\n}\n`
    );

    vscode.window.showInformationMessage('Flutter Clean Core Architecture initialized successfully!');
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to initialize core components: ${error.message}`);
  }
}