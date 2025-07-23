import * as vscode from "vscode";

import { rewriteCommand } from "./commands/rewrite";
import { configureApiKeyCommand } from "./commands/configureApiKey";

export function activate(context: vscode.ExtensionContext) {
  const configureApiKeyCommandDisposable = vscode.commands.registerCommand(
    "rewrite-gpt.configureApiKey",
    configureApiKeyCommand
  );

  const rewriteCommandDisposable = vscode.commands.registerCommand(
    "rewrite-gpt.rewrite",
    rewriteCommand
  );

  context.subscriptions.push(configureApiKeyCommandDisposable);
  context.subscriptions.push(rewriteCommandDisposable);
}

export function deactivate() {}
