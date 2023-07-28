// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ConversationEditorProvider } from "./conversationEditorProvider";
// import { ExampleEditorProvider } from './exampleEditorProvider';
import { setLocale } from "./i18n/i18n";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-webpack" is now active!'
  );

  // Initialize i18n localization
  setLocale(vscode.env.language);

  // register custom editor
  context.subscriptions.push(ConversationEditorProvider.register(context));
  // context.subscriptions.push(ExampleEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}