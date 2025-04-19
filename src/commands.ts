
import * as vscode from 'vscode';
import { AddLogPointTool, IAddLogPointToolParams } from './addLogpointTool';
import { renderPrompt } from '@vscode/prompt-tsx';
import { LogPointPrompt } from './logPointPrompt';

export async function registerCommands(context: vscode.ExtensionContext) {

    const logPointTool = new AddLogPointTool();

    context.subscriptions.push(
        vscode.commands.registerCommand('logpoint-generator.generateLogpoint', async (args: any) => {
            const filepath = args?.uri?.fsPath || vscode.window.activeTextEditor?.document.uri.fsPath;
            const lineNumber = args?.lineNumber || vscode.window.activeTextEditor?.selection.active.line;
            if (!filepath || lineNumber === undefined) {
                vscode.window.showErrorMessage('No file or line number provided.');
                return;
            }

            await generateLogPoint(filepath, lineNumber);
        })
    );
}

async function generateLogPoint(filepath: string, lineNumber: number) {
    const model = (await vscode.lm.selectChatModels()).find(m => m.family === 'gpt-4o-mini' || m.family === 'gpt-4o');
    const tool = vscode.lm.tools.find(tool => tool.name === AddLogPointTool.toolName) as AddLogPointTool | undefined;

    if (model && tool) {
        const result = await renderPrompt(
            LogPointPrompt,
            {
                filepath: filepath,
                lineNumber: lineNumber,
            },
            {
                modelMaxPromptTokens: model.maxInputTokens
            },
            model);

        const responsePromise = model.sendRequest(
            result.messages,
            {
                tools: [tool]
            }
        );

        try {
            const logPointTool = new AddLogPointTool();
            const response = await responsePromise;
            let responseStr = '';
            for await (const part of response.stream) {
                if (part instanceof vscode.LanguageModelTextPart) {
                    responseStr += part.value;
                } else if (part instanceof vscode.LanguageModelToolCallPart) {
                    if (part.name !== logPointTool.name) {
                        console.error(`Unexpected tool call: ${part.name}`);
                    }

                    await logPointTool.invoke({
                        toolInvocationToken: undefined,
                        input: part.input as IAddLogPointToolParams,
                    }, new vscode.CancellationTokenSource().token);
                }
            }
            console.log("Chat Response:", responseStr);
        } catch (error) {
            console.error("Error occurred while processing response:", error);
        }
    } else {
        vscode.window.showErrorMessage('No chat model available.');
    }
}
