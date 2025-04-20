
import * as vscode from 'vscode';
import { generateLogPoint } from './logPointGenerator';
import { ModelSelector } from './modelSelector';

export async function registerCommands(context: vscode.ExtensionContext) {

    const modelSelector = new ModelSelector();

    context.subscriptions.push(
        vscode.commands.registerCommand('logpoint-generator.generateLogpoint', async (args: any) => {
            const filepath = args?.uri?.toString() || vscode.window.activeTextEditor?.document.uri.toString();
            const activeLine = vscode.window.activeTextEditor?.selection.active.line;
            let lineNumber = args?.lineNumber;

            if (lineNumber === undefined && activeLine !== undefined) {
                lineNumber = activeLine + 1;
            }

            if (!filepath || lineNumber === undefined) {
                vscode.window.showErrorMessage('No file or line number provided.');
                return;
            }

            const model = await modelSelector.getModel();
            if (!model) {
                vscode.window.showErrorMessage('No language model selected.');
                return;
            }
            await generateLogPoint(filepath, lineNumber, model);
        })
    );
}

