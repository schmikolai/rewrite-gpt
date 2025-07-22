# Rewrite GPT (VS Code Extension)

A Visual Studio Code extension that rewrites selected text using the OpenAI API.

## Configuration

### Setup OpenAI API Key

Retrieve an OpenAI API Key from the [official website](https://platform.openai.com/api-keys). You can use the command `Configure OpenAI API Key` to store the API key locally or set it manually in the extension settings.

### Customize Rewrite Prompt

Go to the extension settings and customize the rewrite prompt that will be used to alter the selected text.

### Select Model

The model can be selected from any of the official text models taken from the [documentation](https://platform.openai.com/docs/pricing). Copy the exact model name to the model setting of the extension (default is `gpt-4o-mini`)

## Usage

Select the desired text in the editor window and use the `Rewrite with GPT` command. The default key binding is `ctrl+r` (Linux/Windows) / `cmd+r` (Mac).

## Legal

This extension will use the configured API key to make requests to a third-party API according to their pricing model. The author of this extension assumes no liability for any costs incurred.
