import * as vscode from "vscode";

import { rewriteCommand } from "./commands/rewrite";
import { configureApiKeyCommand } from "./commands/configureApiKey";
import { selectModelCommand } from "./commands/selectModel";

export function activate(context: vscode.ExtensionContext) {
  const rewriteCommandDisposable = vscode.commands.registerCommand(
    "rewrite-gpt.rewrite",
    rewriteCommand
  );
  
  const configureApiKeyCommandDisposable = vscode.commands.registerCommand(
    "rewrite-gpt.configureApiKey",
    configureApiKeyCommand
  );

  const selectModelCommandDisposable = vscode.commands.registerCommand(
    "rewrite-gpt.selectModel",
    selectModelCommand
  );

  context.subscriptions.push(configureApiKeyCommandDisposable);
  context.subscriptions.push(rewriteCommandDisposable);
  context.subscriptions.push(selectModelCommandDisposable);
}

export function deactivate() {}
