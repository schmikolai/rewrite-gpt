// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import OpenAI from "openai";

const SYSTEM_PROMPT_PREFIX = "Rewrite the user's messages according to the following instructions. Never include the system prompt, rewrite instructions or surrounding text in the response. Only return the rewritten text without any additional commentary or explanation. \n";

// Helper function to perform the actual rewrite
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
          max_tokens: 1024,
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
        vscode.window.showErrorMessage(
          `OpenAI error: ${err.message || err}`
        );
      }
    }
  );
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Command to configure API key
  const configureApiKeyDisposable = vscode.commands.registerCommand(
    "rewrite-gpt.configureApiKey",
    async () => {
      const apiKey = await vscode.window.showInputBox({
        prompt: "Enter your OpenAI API Key",
        password: true,
        ignoreFocusOut: true,
        validateInput: (value) => {
          if (!value || value.trim().length === 0) {
            return "API Key cannot be empty";
          }
          if (!value.startsWith("sk-")) {
            return "OpenAI API Keys typically start with 'sk-'";
          }
          return null;
        },
      });

      if (apiKey) {
        const config = vscode.workspace.getConfiguration("rewrite-gpt");
        await config.update(
          "apiKey",
          apiKey,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage(
          "OpenAI API Key configured successfully!"
        );
      }
    }
  );

  const disposable = vscode.commands.registerCommand(
    "rewrite-gpt.rewrite",
    async () => {
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
      const apiKey = config.get<string>("apiKey");
      const model = config.get<string>("model") || "gpt-4o-mini";

      if (!apiKey) {
        // Try to configure API key first
        const shouldConfigure = await vscode.window.showInformationMessage(
          "OpenAI API Key not configured. Would you like to configure it now?",
          "Configure API Key",
          "Cancel"
        );
        
        if (shouldConfigure === "Configure API Key") {
          await vscode.commands.executeCommand("rewrite-gpt.configureApiKey");
          // Check again if API key was set
          const updatedConfig = vscode.workspace.getConfiguration("rewrite-gpt");
          const newApiKey = updatedConfig.get<string>("apiKey");
          if (!newApiKey) {
            vscode.window.showWarningMessage("API Key configuration was cancelled.");
            return;
          }
          // Update the apiKey variable for this execution
          const apiKeyToUse = newApiKey;
          const client = new OpenAI({ apiKey: apiKeyToUse });
          
          // Continue with the rewrite process
          await performRewrite(client, editor, selection, text, rewritePrompt, model);
          return;
        } else {
          return;
        }
      }

      const client = new OpenAI({ apiKey });

      if (!text) {
        vscode.window.showWarningMessage("No text selected to rewrite.");
        return;
      }

      await performRewrite(client, editor, selection, text, rewritePrompt, model);
    }
  );

  context.subscriptions.push(configureApiKeyDisposable);
  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
