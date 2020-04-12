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
            let result = cb(e.args);
            webview.postMessage({
                requestId: e.requestId,
                result,
            });
        }
    }
}