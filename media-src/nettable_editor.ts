import { vscode, request, onRequestResponse } from './utils';

const Editor = document.getElementById('editor');

function Init() {
    window.addEventListener('message', (ev) => {
        const evData = ev.data;
        switch (evData.label) {
            case 'update':
                UpdateNetTables(evData.text);
                return;
            default:
                onRequestResponse(evData);
                return;
        }
    });

    const state = vscode.getState();
    if (state && state.text) {
        UpdateNetTables(state.text);
    }
}

function UpdateNetTables(text: string) {
    vscode.setState({text});

    const list: string[] = JSON.parse(text);
    let html = '';

    for(const name of list) {
        html += `
        <tr class="nettable">
            <td>
                <span class="name">${name}</span>
                <input class="edit-input" type="text" value="${name}" name="${name}" />
            </td>
            <td>
                <div class="btn edit" name="${name}">✏️</div>
                <div class="btn remove" name="${name}">❌</div>
                <div class="btn submit">✔️</div>
            </td>
        </tr>
        `;
    }

    Editor.innerHTML = `
        <table class="table">
            <tbody>
                ${html}
            </tbody>
        </table>
        <div id="add-table-form">
            <input type="text" />
            <div class="btn">➕</div>
        </div>
    `;

    Editor.children.item(0).addEventListener('click', (ev) => {
        const target = ev.target as HTMLElement;
        if (target.classList.contains("btn")) {
            // Remove a table name
            if (target.classList.contains("remove")) {
                const name = target.getAttribute("name");
                if (name) {
                    request("remove-table", name);
                }
            }
            // Edit a table name
            else if (target.classList.contains("edit")) {
                const root = target.parentElement.parentElement;
                root.classList.add("editing");
                const input = root.querySelector(".edit-input") as HTMLInputElement;
                input.focus();
            }
            // Submit edited a table name
            else if (target.classList.contains("submit")) {
                const root = target.parentElement.parentElement;
                const input = root.querySelector(".edit-input") as HTMLInputElement;
                if (!input.value) {
                    return;
                }
                const name = input.getAttribute("name");
                if (name) {
                    request("modify-table", name, input.value);
                }
            }
        }
    });
    Editor.children.item(0).addEventListener('change', (ev) => {
        const input = ev.target as HTMLInputElement;
        if (!input.value) {
            return;
        }
        const name = input.getAttribute("name");
        if (name) {
            request("modify-table", name, input.value);
        }
    });

    // Add a table name
    const form = Editor.querySelector("#add-table-form");
    form.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const target = ev.target;
        if (target instanceof HTMLLIElement && target.classList.contains("btn")) {
            const input = form.children.item(0) as HTMLInputElement;
            request("add-table", input.value);
        }
    });
    form.addEventListener('change', (ev) => {
        ev.stopPropagation();
        const input = ev.target as HTMLInputElement;
        request("add-table", input.value);
    });
}

window.onload = Init;