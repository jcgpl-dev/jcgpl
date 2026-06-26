import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function generateConfig(targetUri?: vscode.Uri) {
  let rootPath: string | undefined;

  if (targetUri && targetUri.fsPath) {
    rootPath = targetUri.fsPath;
  } else {
    const workspace = vscode.workspace.workspaceFolders?.[0];

    if (!workspace) {
      vscode.window.showErrorMessage(
        'No workspace opened. Please open a Flutter project.'
      );
      return;
    }

    rootPath = path.join(workspace.uri.fsPath, 'lib');
  }

  const baseConfigPath = rootPath.endsWith('lib')
    ? path.join(rootPath, 'config')
    : path.join(rootPath, 'config');

  try {
    fs.mkdirSync(
      path.join(baseConfigPath, 'theme'),
      { recursive: true }
    );

    fs.mkdirSync(
      path.join(baseConfigPath, 'router'),
      { recursive: true }
    );

    fs.writeFileSync(
      path.join(
        baseConfigPath,
        'theme',
        'app_theme.dart'
      ),
      `import 'package:flutter/material.dart';

class AppTheme {
  AppTheme._();

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorSchemeSeed: Colors.blue,
    brightness: Brightness.light,
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorSchemeSeed: Colors.blue,
    brightness: Brightness.dark,
  );
}
`
    );

    fs.writeFileSync(
      path.join(
        baseConfigPath,
        'router',
        'app_router.dart'
      ),
      `class AppRouter {
  AppRouter._();
}
`
    );

    vscode.window.showInformationMessage(
      'Flutter Config initialized successfully!'
    );
  } catch (error: any) {
  vscode.window.showErrorMessage(
    `Failed to initialize config: ${error instanceof Error ? error.message : String(error)}`
  );
  }
}