import * as vscode from "vscode";

export async function configureApiKeyCommand() {
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
    await config.update("apiKey", apiKey, vscode.ConfigurationTarget.Global);
    vscode.window.showInformationMessage(
      "OpenAI API Key configured successfully!"
    );
  }
}
