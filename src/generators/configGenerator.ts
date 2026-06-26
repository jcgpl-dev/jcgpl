import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function generateConfig(targetUri?: vscode.Uri) {
  let rootPath: string | undefined;

  if (targetUri?.fsPath) {
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

  const baseConfigPath = path.join(rootPath, 'config');

  try {
    const directories = [
      'theme',
      'router',
    ];

    directories.forEach((dir) => {
      fs.mkdirSync(
        path.join(baseConfigPath, dir),
        { recursive: true }
      );
    });

    // app_colors.dart
    fs.writeFileSync(
      path.join(
        baseConfigPath,
        'theme',
        'app_colors.dart'
      ),
      `import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const primary = Color(0xFF6750A4);
  static const secondary = Color(0xFF625B71);

  static const background = Color(0xFFFFFFFF);
  static const surface = Color(0xFFFFFFFF);

  static const error = Color(0xFFB3261E);
}
`
    );

    // app_dimensions.dart
    fs.writeFileSync(
      path.join(
        baseConfigPath,
        'theme',
        'app_dimensions.dart'
      ),
      `class AppDimensions {
  AppDimensions._();

  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
}
`
    );

    // app_text_styles.dart
    fs.writeFileSync(
      path.join(
        baseConfigPath,
        'theme',
        'app_text_styles.dart'
      ),
      `import 'package:flutter/material.dart';

class AppTextStyles {
  AppTextStyles._();
}
`
    );

    // app_theme.dart
    fs.writeFileSync(
      path.join(
        baseConfigPath,
        'theme',
        'app_theme.dart'
      ),
      `import 'package:flutter/material.dart';

import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorSchemeSeed: AppColors.primary,
    brightness: Brightness.light,
  );

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    colorSchemeSeed: AppColors.primary,
    brightness: Brightness.dark,
  );
}
`
    );

    // app_router.dart
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
  } catch (error: unknown) {
    vscode.window.showErrorMessage(
      `Failed to initialize config: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}