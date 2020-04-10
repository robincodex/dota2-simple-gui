import * as path from 'path';
import * as vscode from 'vscode';
import { KeyValues, readFromString, emptyKeyValues, NewKeyValues, formatKeyValues } from 'easy-keyvalues';
import { GetNonce } from './utils';

export class HeroListEditorProvider implements vscode.CustomTextEditorProvider {

    private static readonly viewType = 'dota2EditorForHeroes.editHeroList';
    
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new HeroListEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(HeroListEditorProvider.viewType, provider);
        return providerRegistration;
    }

    constructor( private readonly context: vscode.ExtensionContext ) {
        this.kvList = [];
    }

    private kvList: KeyValues[];

    /**
     * Return KeyValues list, search from "whitelist" or "CustomHeroList"
     */
    private getHeroListKV(): KeyValues {
        let kv = this.kvList.find((v) => v.Key === 'whitelist' || v.Key === 'CustomHeroList');
        if (kv === undefined) {
            vscode.window.showErrorMessage(`Can not find "whitelist" or "CustomHeroList", Please make sure that your file conform to activelist.txt or herolist.txt`);
            return emptyKeyValues;
        }
        return kv;
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
        this.kvList = await readFromString(document.getText());

        // convert text to KeyValues object
        const updateKeyValues = async () => {
            webviewPanel.webview.postMessage({
                label: 'update',
                data: this.getHeroListForJson(),
            });
        };

        const changeHeroState = async (name: string) => {
            let result = this.changeHeroState(name);
            webviewPanel.webview.postMessage({
                label: 'change-state',
                result,
            });

            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                document.uri,
                new vscode.Range(0,0,document.lineCount,0),
                formatKeyValues(this.kvList));
            vscode.workspace.applyEdit(edit);
        };

        webviewPanel.webview.onDidReceiveMessage((ev: any) => {
            switch (ev.label) {
                case 'request-update':
                    updateKeyValues();
                    return;
                case 'request-change-state':
                    changeHeroState(ev.name);
                    return;
            }
        });

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

    /**
     * Return json array string from getHeroListKV()
     */
    private getHeroListForJson(): string {
        let obj: {[key: string]: boolean} = {};
        let root = this.getHeroListKV();
        if (root === emptyKeyValues || !Array.isArray(root.Value)) {
            return '';
        }
        
        for(let kv of root.Value) {
            obj[kv.Key] = kv.Value === "1";
        }

        return JSON.stringify(obj);
    }

    /**
     * Change hero activation
     * @param name hero name, example: npc_dota_hero_axe
     */
    private changeHeroState(name: string): string {
        let root = this.getHeroListKV();
        if (root === emptyKeyValues || !Array.isArray(root.Value)) {
            return '';
        }

        let kv = root.Value.find((v: any) => v.Key === name);
        if (!kv) {
            kv = NewKeyValues(name, "1");
            root.Value.push(kv);
        } else {
            kv.Value = kv.Value==='1'? '0':'1';
        }

        return JSON.stringify({[kv.Key]: kv.Value === "1"});
    }
}