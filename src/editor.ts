import * as path from 'path';
import * as vscode from 'vscode';
import { promisify } from 'util';
import { readdir } from 'fs';

const readdirAsync = promisify(readdir);

type HeroData = {
    HeroName: string,
    ImagePath: string,
};

export class Dota2EditorForHeroesProvider implements vscode.CustomTextEditorProvider {

    private static readonly viewType = 'dota2EditorForHeroes.editKeyValues';
    
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new Dota2EditorForHeroesProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(Dota2EditorForHeroesProvider.viewType, provider);
        return providerRegistration;
    }

    constructor( private readonly context: vscode.ExtensionContext ) {}

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
    }

    private getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    /**
     * Return HTML content
     * @param webview 
     */
    private async getHTML(webview: vscode.Webview): Promise<string> {

        const nonce = this.getNonce();
        const heroes = await this.getHeroList(webview);

        const styleUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'editor.css')
        ));

        const scriptUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'editor.js')
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
                        <div id="hero-list">
                        </div>
                        <div id="hero-info"></div>
                    </div>
                    <script nonce="${nonce}">window.Dota2HeroDataList = ${JSON.stringify(heroes)};</script>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
            </html>
        `;
    }

    /**
     * Return HeroData list from media/heroes
     */
    private async getHeroList(webview: vscode.Webview): Promise<HeroData[]> {
        const basePath = path.join(this.context.extensionPath, 'media/heroes');
        const fileList = await readdirAsync(basePath);
        const list: HeroData[] = [];

        for(let f of fileList) {
            let img = webview.asWebviewUri(vscode.Uri.file(path.join(basePath, f)));
            let name = f.replace('.png', '');
            list.push({
                HeroName: name,
                ImagePath: img.toString(),
            });
        }

        return list;
    }
}