
import * as vscode from 'vscode';
import { AddLogPointTool, IAddLogPointToolParams } from './addLogpointTool';

export async function registerCommands(context: vscode.ExtensionContext) {

    const logPointTool = new AddLogPointTool();

    context.subscriptions.push(
        vscode.commands.registerCommand('logpoint-generator.generateLogpoint', async (args: any) => {
            const model = (await vscode.lm.selectChatModels()).find(m => m.family === 'gpt-4o-mini' || m.family === 'gpt-4o');
            const filepath = args?.uri?.fsPath || vscode.window.activeTextEditor?.document.uri.fsPath;
            const lineNumber = args?.lineNumber || vscode.window.activeTextEditor?.selection.active.line;
            if (model && filepath && lineNumber !== undefined) {
                const responsePromise = model.sendRequest(
                    [vscode.LanguageModelChatMessage.User(`use the logpoint_generator_add_logpoint tool to generate a useful logpoints in ${filepath} at line ${lineNumber} and respond with whether you were successful.`)],
                    //[vscode.LanguageModelChatMessage.User(`what is the directory of ${filepath} `)],
                    {
                        tools: [
                            {
                                name: 'logpoint_generator_add_logpoint',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        filePath: { type: 'string' },
                                        lineNumber: { type: 'number' },
                                        logMessage: { type: 'string' }
                                    },
                                    required: ['filePath', 'lineNumber', 'logMessage']
                                },
                                description: 'Create a debugger log point that will print a log to the debug panel with the provided message when the debugger reaches that point. The message can be interpolated with variables from the debugger by surrounding with {}.'
                            }
                        ]
                    }
                );

                try {
                    const response = await responsePromise;
                    const toolCalls: vscode.LanguageModelToolCallPart[] = [];
                    let responseStr = '';
                    for await (const part of response.stream) {
                        if (part instanceof vscode.LanguageModelTextPart) {
                            responseStr += part.value;
                        } else if (part instanceof vscode.LanguageModelToolCallPart) {
                            toolCalls.push(part);
                            await logPointTool.invoke({
                                toolInvocationToken: undefined,
                                input: part.input as IAddLogPointToolParams
                            });
                        }
                    }
                    console.log("Chat Response:", responseStr);
                } catch (error) {
                    console.error("Error occurred while processing response:", error);
                }
            } else {
                vscode.window.showErrorMessage('No chat model available.');
            }
        })
    );
}