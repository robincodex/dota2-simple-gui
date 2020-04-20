import * as vscode from 'vscode';
import { HeroListEditorProvider } from './herolist_editor';
import { NetTableEditorProvider } from './nettable_editor';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(HeroListEditorProvider.register(context));
    context.subscriptions.push(NetTableEditorProvider.register(context));
}

export function deactivate() {}
