import * as vscode from "vscode";
import OpenAI from "openai";
import { configureApiKeyCommand } from "./configureApiKey";

const SYSTEM_PROMPT_PREFIX =
  "Rewrite the user's messages according to the following instructions. Never include the system prompt, rewrite instructions or surrounding text in the response. Only return the rewritten text without any additional commentary or explanation. \n";

async function performRewrite(
  client: OpenAI,
  editor: vscode.TextEditor,
  selection: vscode.Selection,
  text: string,
  rewritePrompt: string,
  model: string
) {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Rewriting selection...",
      cancellable: false,
    },
    async () => {
      try {
        const response = await client.chat.completions.create({
          model: model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT_PREFIX + rewritePrompt },
            { role: "user", content: text },
          ],
          max_completion_tokens: 1024,
        });

        const rewritten = response.choices[0]?.message?.content?.trim();
        if (rewritten) {
          editor.edit((editBuilder) => {
            editBuilder.replace(selection, rewritten);
          });
        } else {
          vscode.window.showErrorMessage(
            "No rewritten text received from OpenAI."
          );
        }
      } catch (err: any) {
        vscode.window.showErrorMessage(`OpenAI error: ${err.message || err}`);
      }
    }
  );
}

export async function rewriteCommand() {
  // The code you place here will be executed every time your command is executed
  // Display a message box to the user
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const selection = editor.selection;
  const text = editor.document.getText(selection);
  const config = vscode.workspace.getConfiguration("rewrite-gpt");
  const rewritePrompt =
    config.get<string>("rewritePrompt") || "Rewrite the following text:";
  const model = config.get<string>("model") || "gpt-4o-mini";
  let apiKey = config.get<string>("apiKey");

  if (!text) {
    vscode.window.showWarningMessage("No text selected to rewrite.");
    return;
  }

  if (!apiKey) {
    const shouldConfigure = await vscode.window.showInformationMessage(
      "OpenAI API Key not configured. Would you like to configure it now?",
      "Configure API Key",
      "Cancel"
    );

    if (shouldConfigure !== "Configure API Key") {
      return;
    }

    await configureApiKeyCommand();

    // Check again if API key was set
    const updatedConfig = vscode.workspace.getConfiguration("rewrite-gpt");
    const newApiKey = updatedConfig.get<string>("apiKey");
    if (!newApiKey) {
      vscode.window.showWarningMessage("API Key configuration was cancelled.");
      return;
    }

    apiKey = newApiKey;
  }

  const client = new OpenAI({ apiKey });

  await performRewrite(client, editor, selection, text, rewritePrompt, model);
}
