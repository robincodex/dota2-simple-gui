import * as path from 'path';
import * as vscode from 'vscode';
import { GetNonce, writeDocument, RequestHelper } from './utils';

export class HeroListEditorProvider implements vscode.CustomTextEditorProvider {

    private static readonly viewType = 'dota2SimpleGUI.editHeroList';
    
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new HeroListEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(HeroListEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private request: RequestHelper;

    constructor( private readonly context: vscode.ExtensionContext ) {
        this.request = new RequestHelper();
    }

    /**
     * When editor is opened
     * @param document 
     * @param webviewPanel 
     * @param _token 
     */
    public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = await this.getHTML(webviewPanel.webview);

        // send a text to webview
        const updateKeyValues = async () => {
            webviewPanel.webview.postMessage({
                label: 'update',
                text: document.getText(),
            });
        };
        this.request.listenRequest("request-update", updateKeyValues);

        // change hero state
        this.request.listenRequest("request-change-state", (...args: any[]) => {
            let name = args[0];
            if (typeof name !== "string") {
                return;
            }
            this.changeHeroState(document, name);
        });

        const onChangeDocument = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateKeyValues();
            }
        });

        webviewPanel.onDidDispose(() => {
            onChangeDocument.dispose();
        });

        webviewPanel.webview.onDidReceiveMessage((ev: any) => {
            this.request.onRequest(ev, webviewPanel.webview);
        });

        // Initialize it if it is empty text
        if (document.getText().trim().length === 0) {
            let rootKey = '';
            if (document.uri.fsPath.endsWith('herolist.txt')) {
                rootKey = 'CustomHeroList';
            } else {
                rootKey = 'whitelist';
            }
            writeDocument(document, `"${rootKey}"\n{\n}`);
            return;
        }
    }

    /**
     * Change hero state
     */
    private changeHeroState(document: vscode.TextDocument, name: string) {
        let hasChanged = false;
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (line.text.indexOf(name) >= 0) {
                let newText = line.text.replace(/\d/, (v) => {
                    return v==="1"? "0":"1";
                });
                const edit = new vscode.WorkspaceEdit();
                edit.replace(
                    document.uri,
                    line.range,
                    newText);
                vscode.workspace.applyEdit(edit);
                hasChanged = true;
                break;
            }
        }

        // Insert new KeyValues text on not change.
        if (!hasChanged) {
            let pos = new vscode.Position(0, 0);
            for (let i = document.lineCount-1; i >= 0; i--) {
                const line = document.lineAt(i);
                if (line.text.indexOf("}") >= 0) {
                    pos = new vscode.Position(i, 0);
                    break;
                }
            }
            const edit = new vscode.WorkspaceEdit();
            edit.insert(
                document.uri, pos,
                `    "${name}"        "1"\n`);
            vscode.workspace.applyEdit(edit);
        }
    }

    /**
     * Return HTML content
     * @param webview 
     */
    private async getHTML(webview: vscode.Webview): Promise<string> {

        const nonce = GetNonce();

        const styleUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'herolist_editor.css')
        ));

        const scriptUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'herolist_editor.js')
        ));

        const baseUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media')
        ));

        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <link href="${styleUri}" rel="stylesheet" />
                </head>
                <body>
                    <div id="editor">
                    </div>
                    <script nonce="${nonce}" >window.baseUri = '${baseUri}'</script>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
            </html>
        `;
    }
}