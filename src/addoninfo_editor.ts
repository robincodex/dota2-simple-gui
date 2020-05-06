import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';
import { loadFromString, NewKeyValues, formatKeyValues, KeyValues } from 'easy-keyvalues';
import { GetNonce, writeDocument, RequestHelper } from './utils';

const DefaultMapsList = [
    'dota',
    'dota_683',
    'dota_685',
    'dota_688',
    'dota_706',
    'dota_719',
    'dota_722',
];

export class AddonInfoEditorProvider implements vscode.CustomTextEditorProvider {

    private static readonly viewType = 'dota2SimpleGUI.editAddonInfo';
    
    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new AddonInfoEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(AddonInfoEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private kvList: KeyValues[];
    private mapsList: string[];
    private request: RequestHelper;

    constructor( private readonly context: vscode.ExtensionContext ) {
        this.kvList = [];
        this.mapsList = [];
        this.request = new RequestHelper();
    }

    /**
     * Convert data to json string
     */
    private getJSON(): string {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return "{}";
        }

        const result: any = {
            MapsList: this.mapsList,
        };

        // Find map info
        const mapsKV = root.find((v) => v.Key === "maps");
        if (mapsKV && typeof mapsKV.Value === 'string') {
            const maps = mapsKV.Value.split(/\s+/).filter((v) => v!=='');
            const mapsInfo: {
                Map: string,
                MaxPlayers: number,
            }[] = [];
            result["Maps"] = mapsInfo;

            for(const map of maps) {
                const info = {Map: map, MaxPlayers: 0};
                const mkv = root.find((v) => v.Key === map);
                if (mkv && Array.isArray(mkv.Value)) {
                    const child = mkv.Value.find((v) => v.Key === 'MaxPlayers');
                    if (child && !Array.isArray(child.Value)) {
                        info.MaxPlayers = parseInt(child.Value) || 0;
                    }
                }
                mapsInfo.push(info);
            }
        } else {
            result["Maps"] = [];
        }

        // Find options
        const options: {[key: string]: boolean} = {};
        for(const kv of root) {
            if (kv.Value === "1" || kv.Value === "0") {
                options[kv.Key] = kv.Value === "1";
            }
        }
        result["Options"] = options;

        // Keyboard
        const Keyboard: {
            Index: string,
            Key: string,
            Command: string,
            Name: string,
        }[] = [];
        const Default_Keys = root.find((v) => v.Key === "Default_Keys");
        if (Default_Keys && Array.isArray(Default_Keys.Value)) {
            for(const kv of Default_Keys.Value) {
                if (Array.isArray(kv.Value)) {
                    const data: typeof Keyboard[0] = {
                        Index: kv.Key,
                        Key: '',
                        Command: '',
                        Name: '',
                    };
                    Keyboard.push(data);
                    const Key = kv.Value.find((v) => v.Key === 'Key');
                    if (Key && !Array.isArray(Key.Value)) {
                        data['Key'] = Key.Value;
                    }
                    const Command = kv.Value.find((v) => v.Key === 'Command');
                    if (Command && !Array.isArray(Command.Value)) {
                        data['Command'] = Command.Value;
                    }
                    const Name = kv.Value.find((v) => v.Key === 'Name');
                    if (Name && !Array.isArray(Name.Value)) {
                        data['Name'] = Name.Value;
                    }
                }
            }
        }
        result["Keyboard"] = Keyboard;

        return JSON.stringify(result);
    }

    /**
     * Change MaxPlayers property of map
     * @param map Map name
     * @param count Player count
     */
    private changeMaxPlayers(map: string, count: number): void {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return;
        }
        const mkv = root.find((v) => v.Key === map);
        if (mkv && Array.isArray(mkv.Value)) {
            const child = mkv.Value.find((v) => v.Key === 'MaxPlayers');
            if (child && !Array.isArray(child.Value)) {
                child.Value = count.toString();
            }
        } else {
            let index = root.findIndex((v) => v.Key === "maps");
            if (index < 0) {
                index = 0;
            }
            root.splice(index+1, 0, NewKeyValues(map, [NewKeyValues("MaxPlayers", count.toString())]));
        }
    }

    /**
     * Add a map to value of maps
     * @param map Map name
     */
    private addMap(map: string): void {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return;
        }
        const mapsKV = root.find((v) => v.Key === "maps");
        if (mapsKV && typeof mapsKV.Value === 'string') {
            let maps = mapsKV.Value.split(/\s+/);
            if (maps.includes(map)) {
                return;
            }
            if (mapsKV.Value.length <= 0) {
                mapsKV.Value += map;
            } else {
                mapsKV.Value += " " + map;
            }
        }
        else {
            root.splice(0, 0, NewKeyValues("maps", map));
        }
    }

    /**
     * Remove a map
     * @param map Map name
     */
    private removeMap(map: string) {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return;
        }
        const mapsKV = root.find((v) => v.Key === "maps");
        if (mapsKV && typeof mapsKV.Value === 'string') {
            let maps = mapsKV.Value.split(/\s+/);
            if (!maps.includes(map)) {
                return;
            }
            let result = "";
            for(const m of maps) {
                if (m === map) {
                    continue;
                }
                result += m + " ";
            }
            mapsKV.Value = result.substring(0, result.length-1);
        }
    }

    /**
     * Toggle a option
     * @param key 
     */
    private toggleOption(key: string) {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return;
        }

        const kv = root.find((v) => v.Key === key);
        if (kv && typeof kv.Value === "string") {
            kv.Value = kv.Value==='1'? '0':'1';
        } else {
            let index = root.findIndex((v) => v.Key === "Default_Keys");
            if (index < 0) {
                index = root.length;
            }
            root.splice(index, 0, NewKeyValues(key, "1"));
        }
    }

    /**
     * Modify a key
     */
    private keyboardModifyKey(index: string, key: string, cmd: string, name: string) {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return;
        }
        const Default_Keys = root.find((v) => v.Key === "Default_Keys");
        if (Default_Keys && Array.isArray(Default_Keys.Value)) {
            const kv = Default_Keys.Value.find((v) => v.Key === index);
            if (kv && Array.isArray(kv.Value)) {
                const Key = kv.Value.find((v) => v.Key === 'Key');
                if (Key && !Array.isArray(Key.Value)) {
                    Key.Value = key;
                } else {
                    kv.Value.push(NewKeyValues("Key", key));
                }
                const Command = kv.Value.find((v) => v.Key === 'Command');
                if (Command && !Array.isArray(Command.Value)) {
                    Command.Value = cmd;
                } else {
                    kv.Value.push(NewKeyValues("Command", cmd));
                }
                const Name = kv.Value.find((v) => v.Key === 'Name');
                if (Name && !Array.isArray(Name.Value)) {
                    Name.Value = name;
                } else {
                    kv.Value.push(NewKeyValues("Name", name));
                }
            }
        }
    }

    /**
     * Remove a key
     * @param map Map name
     */
    private keyboardRemoveKey(index: string) {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return;
        }
        const Default_Keys = root.find((v) => v.Key === "Default_Keys");
        if (Default_Keys && Array.isArray(Default_Keys.Value)) {
            Default_Keys.Value = Default_Keys.Value.filter((v) => v.Key !== index);
        }
    }

    /**
     * Add a key
     */
    private keyboardNewKey(key: string, cmd: string, name: string) {
        const root = this.kvList[0].Value;
        if (!Array.isArray(root)) {
            return;
        }
        let Default_Keys = root.find((v) => v.Key === "Default_Keys");
        if (!Default_Keys) {
            Default_Keys = NewKeyValues("Default_Keys", []);
            root.push(Default_Keys);
        }
        if (Array.isArray(Default_Keys.Value)) {
            // Find max number
            const indexList = Default_Keys.Value.map((v) => v.Key);
            let maxNum = 0;
            for(const index of indexList) {
                const n = parseInt(index);
                if (n && n > maxNum) {
                    maxNum = n;
                }
            }
            maxNum++;
            const newIndex = maxNum<10? '0'+maxNum : maxNum.toString();
            
            Default_Keys.Value.push(NewKeyValues(newIndex, [
                NewKeyValues("Key", key),
                NewKeyValues("Command", cmd),
                NewKeyValues("Name", name),
            ]));
        }
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

        // Find maps list from maps folder
        if (this.mapsList.length <= 0) {
            const mapsPath = path.join(document.uri.fsPath, "../maps");
            if (fs.existsSync(mapsPath)) {
                const list = await fs.promises.readdir(mapsPath);
                for(const f of list) {
                    if (f.lastIndexOf(".vpk") > 0) {
                        this.mapsList.push(f.replace(".vpk", ""));
                    }
                }
            }
            this.mapsList.push(...DefaultMapsList);
        }

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

        // Change MaxPlayers property of map
        this.request.listenRequest("change-map-max-players", (...args: any[]) => {
            if (args.length < 2) {
                return;
            }
            this.changeMaxPlayers(args[0], args[1]);
            writeDocument(document, formatKeyValues(this.kvList));
        });

        // Add a map to value of maps
        this.request.listenRequest("add-map", (...args: any[]) => {
            if (args.length < 1) {
                return;
            }
            this.addMap(args[0]);
            writeDocument(document, formatKeyValues(this.kvList));
        });

        // Remove a map
        this.request.listenRequest("remove-map", (...args: any[]) => {
            if (args.length < 1) {
                return;
            }
            this.removeMap(args[0]);
            writeDocument(document, formatKeyValues(this.kvList));
        });

        // Toggle a option
        this.request.listenRequest("toggle-option", (...args: any[]) => {
            if (args.length < 1) {
                return;
            }
            this.toggleOption(args[0]);
            writeDocument(document, formatKeyValues(this.kvList));
        });

        // Remove a key
        this.request.listenRequest("keyboard-remove", (...args: any[]) => {
            if (args.length < 1) {
                return;
            }
            this.keyboardRemoveKey(args[0]);
            writeDocument(document, formatKeyValues(this.kvList));
        });

        // Modify a key
        this.request.listenRequest("keyboard-modify", (...args: any[]) => {
            if (args.length < 4) {
                return;
            }
            this.keyboardModifyKey(args[0], args[1], args[2], args[3]);
            writeDocument(document, formatKeyValues(this.kvList));
        });

        // Add a new key
        this.request.listenRequest("keyboard-add-key", (...args: any[]) => {
            if (args.length < 3) {
                return;
            }
            this.keyboardNewKey(args[0], args[1], args[2]);
            writeDocument(document, formatKeyValues(this.kvList));
        });

        const onChangeDocument = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.contentChanges.length <= 0) {
                return;
            }
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

        updateKeyValues();
    }

    /**
     * Return HTML content
     * @param webview 
     */
    private async getHTML(webview: vscode.Webview): Promise<string> {

        const nonce = GetNonce();

        const styleUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'addoninfo_editor.css')
        ));

        const scriptUri = webview.asWebviewUri(vscode.Uri.file(
            path.join(this.context.extensionPath, 'media', 'addoninfo_editor.js')
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
                    <script nonce="${nonce}" src="${scriptUri}"></script>
                </body>
            </html>
        `;
    }
}