import * as vscode from 'vscode';
import { HeroEditorProvider } from './hero_editor';
import { HeroListEditorProvider } from './herolist_editor';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(HeroEditorProvider.register(context));
    context.subscriptions.push(HeroListEditorProvider.register(context));
}

export function deactivate() {}
