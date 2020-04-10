import * as vscode from 'vscode';
import { Dota2EditorForHeroesProvider } from './editor';
import { HeroListEditorProvider } from './herolist_editor';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(Dota2EditorForHeroesProvider.register(context));
    context.subscriptions.push(HeroListEditorProvider.register(context));
}

export function deactivate() {}
