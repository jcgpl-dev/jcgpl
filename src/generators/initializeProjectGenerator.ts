import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

import { generateCore } from './coreGenerator';
import { generateConfig } from './configGenerator';

export async function initializeProject(
  targetUri?: vscode.Uri
) {
  const workspace =
    vscode.workspace.workspaceFolders?.[0];

  if (!workspace) {
    vscode.window.showErrorMessage(
      'No workspace opened. Please open a Flutter project.'
    );
    return;
  }

  const libPath = path.join(
    workspace.uri.fsPath,
    'lib'
  );

  try {
    fs.mkdirSync(libPath, {
      recursive: true,
    });

    fs.mkdirSync(
      path.join(libPath, 'features'),
      {
        recursive: true,
      }
    );

    await generateCore(
      vscode.Uri.file(libPath)
    );

    await generateConfig(
      vscode.Uri.file(libPath)
    );

    vscode.window.showInformationMessage(
      'Flutter Clean Architecture initialized successfully!'
    );
  } catch (error: any) {
    vscode.window.showErrorMessage(
      `Failed to initialize project: ${
        error.message
      }`
    );
  }
}