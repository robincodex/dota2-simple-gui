import * as vscode from 'vscode';
import { HeroListEditorProvider } from './herolist_editor';
import { NetTableEditorProvider } from './nettable_editor';
import { AddonInfoEditorProvider } from './addoninfo_editor';
import { SoundEventsEditorProvider } from './soundevents_editor';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(HeroListEditorProvider.register(context));
    context.subscriptions.push(NetTableEditorProvider.register(context));
    context.subscriptions.push(AddonInfoEditorProvider.register(context));
    context.subscriptions.push(SoundEventsEditorProvider.register(context));
}

export function deactivate() {}
