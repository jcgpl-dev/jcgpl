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

  const rootPath =
    targetUri?.fsPath ??
    workspace.uri.fsPath;

  const rootName =
    path.basename(rootPath);

  const lines: string[] = [];

  lines.push(rootName);

  buildTree(
    rootPath,
    '',
    lines
  );

  const snapshot =
    lines.join('\n');

  // Copy to clipboard
  await vscode.env.clipboard.writeText(
    snapshot
  );

  // Open preview tab
  const document =
    await vscode.workspace.openTextDocument({
      content: snapshot,
      language: 'plaintext',
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

  const action =
    await vscode.window.showInformationMessage(
      '✅ Project snapshot copied to clipboard.',
      'Save As'
    );

  if (action === 'Save As') {
    const saveUri =
      await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(
          `${rootName}_snapshot.txt`
        ),
        filters: {
          'Text Files': ['txt'],
        },
      });

    if (saveUri) {
      fs.writeFileSync(
        saveUri.fsPath,
        snapshot
      );

      vscode.window.showInformationMessage(
        'Project snapshot saved successfully!'
      );
    }
  }
}

function buildTree(
  currentPath: string,
  indent: string,
  lines: string[]
) {
  const children = fs
    .readdirSync(currentPath)
    .filter(
      (name) =>
        !ignoredDirectories.includes(
          name
        )
    )
    .sort((a, b) => {
      const aPath =
        path.join(currentPath, a);

      const bPath =
        path.join(currentPath, b);

      const aDir =
        fs.statSync(aPath).isDirectory();

      const bDir =
        fs.statSync(bPath).isDirectory();

      if (aDir && !bDir) {
        return -1;
      }

      if (!aDir && bDir) {
        return 1;
      }

      return a.localeCompare(b);
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

    lines.push(
      `${indent}─────────────────────────────────────`
    );

    content
      .split(/\r?\n/)
      .forEach((line) => {
        lines.push(
          `${indent}${line}`
        );
      });

    lines.push(
      `${indent}─────────────────────────────────────`
    );

  } catch {
    lines.push(
      `${indent}[Unable to read file]`
    );

    lines.push('');
  }
}