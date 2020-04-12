
interface IVscode {
    setState(data: any): void;
    getState(): any;
    postMessage(data: any): void;
}

// @ts-ignore
export const vscode: IVscode = acquireVsCodeApi();

const requestMap = new Map<number, Function>();
let requestCounter = 1;

// Send a request to vscode
export async function request<T>(label: string, ...args: any[]) {
    return new Promise<T>((resolve) => {
        let requestId = requestCounter++;
        requestMap.set(requestId, resolve);

        // @ts-ignore
        vscode.postMessage({
            requestId,
            label,
            args,
        });
    });
}

export function onRequestResponse(data: any) {
    if (typeof data.requestId === 'number') {
        let resolve = requestMap.get(data.requestId);
        if (resolve) {
            resolve(data.result);
            requestMap.delete(data.requestId);
        }
    }
}