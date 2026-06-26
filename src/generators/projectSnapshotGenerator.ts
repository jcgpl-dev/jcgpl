import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const ignoredDirectories = [
  '.git',
  '.dart_tool',
  '.idea',
  'build',
  '.fvm',
  '.vscode',
  'node_modules',
];

const ignoredExtensions = [
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.bmp',
  '.ico',
  '.webp',
  '.ttf',
  '.otf',
  '.woff',
  '.woff2',
  '.mp4',
  '.mp3',
  '.zip',
  '.jar',
];

export async function generateProjectSnapshot(
  targetUri?: vscode.Uri
) {
  const workspace =
    vscode.workspace.workspaceFolders?.[0];

  if (!workspace) {
    vscode.window.showErrorMessage(
      'No workspace opened.'
    );
    return;
  }

  // THIS makes it dynamic.
  const rootPath =
    targetUri?.fsPath ??
    workspace.uri.fsPath;

  const rootName =
    path.basename(rootPath);

  const saveUri =
    await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.file(
        path.join(
          workspace.uri.fsPath,
          `${rootName}_snapshot.txt`
        )
      ),
      filters: {
        Text: ['txt'],
      },
    });

  if (!saveUri) {
    return;
  }

  const lines: string[] = [];

  lines.push(rootName);
  buildTree(rootPath, '', lines);

  fs.writeFileSync(
    saveUri.fsPath,
    lines.join('\n')
  );

  vscode.window.showInformationMessage(
    'Project snapshot generated successfully!'
  );

  vscode.workspace.openTextDocument(
    saveUri.fsPath
  ).then(vscode.window.showTextDocument);
}

function buildTree(
  currentPath: string,
  indent: string,
  lines: string[]
) {
  const children = fs
    .readdirSync(currentPath)
    .filter((name) => {
      return !ignoredDirectories.includes(
        name
      );
    });

  children.forEach((name, index) => {
    const fullPath =
      path.join(currentPath, name);

    const stat =
      fs.statSync(fullPath);

    const isLast =
      index === children.length - 1;

    const prefix = isLast
      ? ' ┗ '
      : ' ┣ ';

    const pad = isLast
      ? '   '
      : ' ┃ ';

    const nextIndent =
      indent + pad;

    lines.push(
      `${indent}${prefix}${name}`
    );

    if (stat.isDirectory()) {
      buildTree(
        fullPath,
        nextIndent,
        lines
      );
    } else {
      appendFileContent(
        fullPath,
        nextIndent,
        lines
      );
    }
  });
}

function appendFileContent(
  filePath: string,
  indent: string,
  lines: string[]
) {
  const ext =
    path.extname(filePath)
      .toLowerCase();

  if (
    ignoredExtensions.includes(ext)
  ) {
    lines.push(
      `${indent}[Binary File Omitted]`
    );
    lines.push('');
    return;
  }

  try {
    const content =
      fs.readFileSync(
        filePath,
        'utf8'
      );

    content
      .split('\n')
      .forEach((line) => {
        lines.push(
          `${indent}${line}`
        );
      });

    lines.push('');
  } catch {
    lines.push(
      `${indent}[Unable to read file]`
    );

    lines.push('');
  }
}