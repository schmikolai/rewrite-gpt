import * as vscode from "vscode";
import OpenAI from "openai";

export async function selectModelCommand() {
  const config = vscode.workspace.getConfiguration("rewrite-gpt");
  const apiKey = config.get<string>("apiKey");

  const modelConfig = config.inspect("model");

  let configurationTarget = vscode.ConfigurationTarget.Global;

  if (modelConfig?.workspaceValue) {
    const configurationTargetChoice = await vscode.window.showQuickPick(
      ["Workspace", "Global (reset workspace setting)"],
      {
        placeHolder: "A workspace configuration for the model was found. What setting would you like to change?"
      }
    );
    if (configurationTargetChoice === "Workspace") {
      configurationTarget = vscode.ConfigurationTarget.Workspace;
    } else if (configurationTargetChoice === "Global (reset workspace setting)") {
      await config.update("model", undefined, vscode.ConfigurationTarget.Workspace);
    } else {
      return;
    }
  }

  const client = new OpenAI({ apiKey });
  const models = await client.models.list({});
  const modelOptions = models.data
    .sort((a, b) => b.created - a.created)
    .map((model) => ({
      label: model.id,
      description: `Created: ${new Date(
        model.created * 1000
      ).toLocaleDateString()}`,
    }));

  const selectedModel = await vscode.window.showQuickPick(modelOptions, {
    placeHolder: "Select a model for rewriting",
    canPickMany: false,
    matchOnDescription: false,
  });

  if (selectedModel) {
    await config.update(
      "model",
      selectedModel.label,
      configurationTarget
    );
    const targetLabel = configurationTarget === vscode.ConfigurationTarget.Global
      ? "Global"
      : "Workspace";
    vscode.window.showInformationMessage(`${targetLabel} model set to ${selectedModel.label}`);
  }
}
