import { renderPrompt } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { AddLogPointTool, IAddLogPointToolParams } from './addLogpointTool';
import { LogPointPrompt } from './logPointPrompt';

export async function generateLogPoint(filepath: string, lineNumber: number, chatModel: vscode.LanguageModelChat) {
    const registeredTool = vscode.lm.tools.find(tool => tool.name === AddLogPointTool.toolName) as AddLogPointTool | undefined;

    if (!registeredTool) {
        console.error(`Tool ${AddLogPointTool.toolName} not found`);
        return;
    }

    const result = await renderPrompt(
        LogPointPrompt,
        {
            filepath: filepath,
            lineNumber: lineNumber,
        },
        {
            modelMaxPromptTokens: chatModel.maxInputTokens
        },
        chatModel);

    try {
        let responseStr = '';
        const progressOptions = { location: vscode.ProgressLocation.Notification, title: "Generating message for logpoint..." };

        await vscode.window.withProgress(progressOptions, async (progress, token) => {
            token.onCancellationRequested(() => {
                console.log("User canceled the operation.");
            });

            const response = await chatModel.sendRequest(
                result.messages,
                {
                    tools: [registeredTool]
                },
                token
            );

            const toolInstance = new AddLogPointTool();
            let toolResult: vscode.LanguageModelToolResult | undefined;

            for await (const part of response.stream) {
                if (part instanceof vscode.LanguageModelTextPart) {
                    responseStr += part.value;
                    progress.report({ message: "Creating log point with message..." });
                } else if (part instanceof vscode.LanguageModelToolCallPart) {
                    if (part.name !== toolInstance.name) {
                        console.error(`Unexpected tool call: ${part.name}`);
                    }

                    toolResult = await toolInstance.invoke({
                        toolInvocationToken: undefined,
                        input: part.input as IAddLogPointToolParams,
                    }, token);
                }
            }
            if (!toolResult && responseStr) {
                console.warn('Got text response instead of tool result from chat model:', responseStr);
            }
        });
    } catch (error) {
        console.error("Error occurred while processing response:", error);
    }
}
