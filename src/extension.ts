import * as vscode from 'vscode';
import { HeroListEditorProvider } from './herolist_editor';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(HeroListEditorProvider.register(context));
}

export function deactivate() {}
