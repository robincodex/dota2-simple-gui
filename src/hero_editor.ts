import * as path from 'path';
import * as vscode from 'vscode';
import { GetNonce, onRequest, listenRequest } from './utils';
import { KeyValues, readFromString, emptyKeyValues } from 'easy-keyvalues';

export class HeroEditorProvider implements vscode.CustomTextEditorProvider {

    private static readonly viewType = 'dota2EditorForHeroes.editKeyValues';
    
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new HeroEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(HeroEditorProvider.viewType, provider);
        return providerRegistration;
    }

    constructor( private readonly context: vscode.ExtensionContext ) {
        this.kvList = [];
    }

    private kvList: KeyValues[];

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
        this.kvList = await readFromString(document.getText());

        listenRequest('get-hero-list', this.getHeroList.bind(this));

        webviewPanel.webview.onDidReceiveMessage((e) => {
            onRequest(e, webviewPanel.webview);
        });
    }

    /**
     * Return HTML content
     * @param webview 
     */
    private async getHTML(webview: vscode.Webview): Promise<string> {

        const nonce = GetNonce();

        const styleUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'hero_editor.css')
        ));

        const scriptUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'hero_editor.js')
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
                        <div id="editor-main">
                            <div id="hero-list">
                            </div>
                            <div id="hero-info">
                            </div>
                        </div>
                    </div>
                    <script nonce="${nonce}" >window.baseUri = '${baseUri}'</script>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
            </html>
        `;
    }

    private getDOTAHeroes() {
        const kv = this.kvList.find((v) => v.Key === 'DOTAHeroes');
        if (!kv) {
            return emptyKeyValues;
        }
        return kv;
    }

    private getHeroList(...args: any[]) {
        let heroes = this.getDOTAHeroes();
        if (!Array.isArray(heroes.Value)) {
            return [];
        }

        type HeroData = {
            Name: string,
            HeroName: string
        };

        let result: HeroData[] = [];
        for(const v of heroes.Value) {
            let HeroName = '';
            if (Array.isArray(v.Value)) {
                const kv = v.Value.find((v) => v.Key === 'override_hero');
                if (kv && typeof kv.Value === 'string') {
                    HeroName = kv.Value;
                }
            }
            if (HeroName.indexOf("npc_dota_hero_") !== 0) {
                continue;
            }
            result.push({
                Name: v.Key,
                HeroName,
            });
        }

        return result;
    }
}