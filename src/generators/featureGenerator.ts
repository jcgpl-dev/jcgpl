import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function generateFeature(targetUri?: vscode.Uri) {
  // 1. Get Target Directory Path
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

  // 2. Collect Feature Meta-data
  const featureName = await vscode.window.showInputBox({
    prompt: 'Enter Feature Name (use snake_case)',
    placeHolder: 'authentication'
  });

if (!featureName) {
  return;
}

  // 3. Define Clean Architecture Directory Map
  const baseFeaturePath = path.join(rootPath, featureName);
const directories = [
  'data/datasources/local',
  'data/datasources/remote',
  'data/models',
  'data/repositories',

  'domain/entities',
  'domain/repositories',
  'domain/usecases',

  'presentation/bloc',
  'presentation/pages',
  'presentation/widgets',
];

  try {
    // Create directories recursively
    directories.forEach(dir => {
      fs.mkdirSync(path.join(baseFeaturePath, dir), { recursive: true });
    });

    // 4. Generate Starter Templates
    const pascalName = toPascalCase(featureName);

    // Repository template
    fs.writeFileSync(
      path.join(baseFeaturePath, 'domain/repositories', `${featureName}_repository.dart`),
      `abstract class ${pascalName}Repository {\n  // TODO: Define domain contract operations\n}\n`
    );

    // BLoC templates
    fs.writeFileSync(
      path.join(baseFeaturePath, 'presentation/bloc', `${featureName}_event.dart`),
      `part of '${featureName}_bloc.dart';\n\nabstract class ${pascalName}Event {}\n`
    );

    fs.writeFileSync(
      path.join(baseFeaturePath, 'presentation/bloc', `${featureName}_state.dart`),
      `part of '${featureName}_bloc.dart';\n\nabstract class ${pascalName}State {}\n\nclass ${pascalName}Initial extends ${pascalName}State {}\n`
    );

    fs.writeFileSync(
      path.join(baseFeaturePath, 'presentation/bloc', `${featureName}_bloc.dart`),
      `import 'package:flutter_bloc/flutter_bloc.dart';\n\npart '${featureName}_event.dart';\npart '${featureName}_state.dart';\n\nclass ${pascalName}Bloc extends Bloc<${pascalName}Event, ${pascalName}State> {\n  ${pascalName}Bloc() : super(${pascalName}Initial()) {\n    on<${pascalName}Event>((event, emit) {\n      // TODO: Implement event handler\n    });\n  }\n}\n`
    );

    vscode.window.showInformationMessage(`Feature "${featureName}" scaffolded successfully!`);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Failed to generate feature: ${error.message}`);
  }
}

/**
 * Transforms snake_case or kebab-case strings into PascalCase.
 */
function toPascalCase(text: string): string {
  return text
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}