import * as path from 'path';
import * as vscode from 'vscode';
import { GetNonce, writeDocument, RequestHelper, locale } from './utils';
import { KeyValues, loadFromString, formatKeyValues, NewKeyValues } from 'easy-keyvalues';

export class HeroListEditorProvider implements vscode.CustomTextEditorProvider {

    private static readonly viewType = 'dota2SimpleGUI.editHeroList';
    
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new HeroListEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(HeroListEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private request: RequestHelper;
    private kvList: KeyValues[];

    constructor( private readonly context: vscode.ExtensionContext ) {
        this.request = new RequestHelper();
        this.kvList = [];
    }

    private getJSON() {
        const root = this.kvList.find((v) => v.Key==='whitelist' || v.Key==='CustomHeroList');
        if (!root || !Array.isArray(root.Value)) {
            return '{}';
        }

        const data: {[key: string]: string} = {};
        for(const kv of root.Value) {
            if (typeof kv.Value === 'string') {
                data[kv.Key] = kv.Value;
            }
        }

        return JSON.stringify(data);
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
            try {
                this.kvList = await loadFromString(document.getText());
            } catch(e) {
                vscode.window.showErrorMessage(e.toString() + "\n" + document.uri.fsPath);
            }
            webviewPanel.webview.postMessage({
                label: 'update',
                text: this.getJSON(),
            });
        };

        // change hero state
        this.request.listenRequest("request-change-state", (...args: any[]) => {
            let name = args[0];
            if (typeof name !== "string") {
                return;
            }
            this.changeHeroState(document, name);
        });

        this.request.listenRequest("copy-heroname", (...args: any[]) => {
            let name = args[0];
            if (typeof name !== "string") {
                return;
            }
            vscode.env.clipboard.writeText(name);
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

        updateKeyValues();
    }

    /**
     * Change hero state
     */
    private changeHeroState(document: vscode.TextDocument, name: string) {
        const root = this.kvList.find((v) => v.Key==='whitelist' || v.Key==='CustomHeroList');
        if (!root || !Array.isArray(root.Value)) {
            return;
        }

        const kv = root.Value.find((v) => v.Key === name);
        if (kv && typeof kv.Value === 'string') {
            if (kv.Value === '0') {
                kv.Value = '1';
            } else if (kv.Value === '1') {
                kv.Value = '-1';
            } else if (kv.Value === '-1') {
                kv.Value = '0';
            }
        } else if (kv) {
            kv.Value = "1";
        } else {
            root.Value.push(NewKeyValues(name, "1"));
        }

        writeDocument(document, formatKeyValues(this.kvList));
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
            <html lang="${locale()}">
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