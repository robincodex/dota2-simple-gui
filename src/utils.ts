import * as vscode from 'vscode';

export function GetNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

const requestMap = new Map<string, Function>();

export function listenRequest(label: string, cb: Function) {
    requestMap.set(label, cb);
}

export function onRequest(e: any, webview: vscode.Webview) {
    if (e.label && e.requestId) {
        let cb = requestMap.get(e.label);
        if (cb) {
            let result = cb(...e.args);
            webview.postMessage({
                requestId: e.requestId,
                result,
            });
        }
    }
}

export function writeDocument(document: vscode.TextDocument, text: string) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
        document.uri, 
        new vscode.Range(0,0,document.lineCount, 0),
        text);
    vscode.workspace.applyEdit(edit);
}

export function initializeKV3ToDocument(document: vscode.TextDocument) {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
        document.uri, 
        new vscode.Range(0,0,document.lineCount, 0),
        `<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:generic:version{7412167c-06e9-4698-aff2-e63eb59037e7} -->
{
}`);
    vscode.workspace.applyEdit(edit);
}