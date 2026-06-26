import * as vscode from 'vscode';
import { generateFeature } from './generators/featureGenerator';
import { generateCore } from './generators/coreGenerator'; 
import { generateConfig } from './generators/configGenerator';
import { initializeProject }
  from './generators/initializeProjectGenerator';
import {
  generateProjectSnapshot
} from './generators/projectSnapshotGenerator';

export function activate(context: vscode.ExtensionContext) {
  // Register Feature Generator
  const featureDisposable = vscode.commands.registerCommand(
    'flutter-clean.generateFeature',
    async (uri: vscode.Uri) => {
      await generateFeature(uri);
    }
  );

  // Register Core Architecture Generator
  const coreDisposable = vscode.commands.registerCommand(
    'flutter-clean.generateCore',
    async (uri: vscode.Uri) => {
      await generateCore(uri);
    }
  );

  const configCommand =
  vscode.commands.registerCommand(
    'flutter-architect.generateConfig',
    generateConfig
    );
  
  const initializeProjectCommand =
  vscode.commands.registerCommand(
    'flutter-architect.initializeProject',
    initializeProject
  );

  const snapshotCommand =
  vscode.commands.registerCommand(
    'flutter-architect.generateProjectSnapshot',
    generateProjectSnapshot
  );


  context.subscriptions.push(featureDisposable, coreDisposable, configCommand, initializeProjectCommand, snapshotCommand);
}

export function deactivate() {}