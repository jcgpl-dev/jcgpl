import * as vscode from 'vscode';
import { generateFeature } from './generators/featureGenerator';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'flutter-clean.generateFeature', // Fixed to match package.json exactly
    async (uri: vscode.Uri) => {
      // Pass the selected directory URI if triggered via right-click
      await generateFeature(uri);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}