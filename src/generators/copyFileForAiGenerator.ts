import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function copyFileForAi(
  targetUri?: vscode.Uri
) {
  if (!targetUri) {
    vscode.window.showErrorMessage(
      'Please right-click a file.'
    );
    return;
  }

  try {
    const stat = fs.statSync(
      targetUri.fsPath
    );

    if (stat.isDirectory()) {
      vscode.window.showErrorMessage(
        'Please select a file.'
      );
      return;
    }

    const workspace =
      vscode.workspace.workspaceFolders?.[0];

    if (!workspace) {
      vscode.window.showErrorMessage(
        'No workspace opened.'
      );
      return;
    }

    const relativePath = path
      .relative(
        workspace.uri.fsPath,
        targetUri.fsPath
      )
      .replaceAll('/', '\\');

    const content = fs.readFileSync(
      targetUri.fsPath,
      'utf8'
    );

    const extension = path
      .extname(targetUri.fsPath)
      .replace('.', '');

    const snapshot =
`${relativePath}

\`\`\`${extension}
${content}
\`\`\``;

    // Copy to clipboard
    await vscode.env.clipboard.writeText(
      snapshot
    );

    // Open preview
    const document =
      await vscode.workspace.openTextDocument({
        content: snapshot,
        language: 'markdown',
      });

    await vscode.window.showTextDocument(
      document,
      {
        preview: true,
        preserveFocus: false,
        viewColumn:
          vscode.ViewColumn.Beside,
      }
    );

    vscode.window.showInformationMessage(
      '✅ File snapshot copied to clipboard.'
    );
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to copy file snapshot: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}