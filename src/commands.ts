
import * as vscode from 'vscode';
import { AddLogPointTool } from './addLogpointTool';
import { generateLogPoint } from './logPointGenerator';

export async function registerCommands(context: vscode.ExtensionContext) {

    const logPointTool = new AddLogPointTool();

    context.subscriptions.push(
        vscode.commands.registerCommand('logpoint-generator.generateLogpoint', async (args: any) => {
            const filepath = args?.uri?.toString() || vscode.window.activeTextEditor?.document.uri.toString();
            const lineNumber = args?.lineNumber || vscode.window.activeTextEditor?.selection.active.line;
            if (!filepath || lineNumber === undefined) {
                vscode.window.showErrorMessage('No file or line number provided.');
                return;
            }

            await generateLogPoint(filepath, lineNumber);
        })
    );
}

