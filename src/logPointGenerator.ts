import { renderPrompt } from '@vscode/prompt-tsx';
import * as vscode from 'vscode';
import { AddLogPointTool, IAddLogPointToolParams } from './addLogpointTool';
import { LogPointPrompt } from './logPointPrompt';

export async function generateLogPoint(filepath: string, lineNumber: number, chatModel: vscode.LanguageModelChat) {
    const tool = vscode.lm.tools.find(tool => tool.name === AddLogPointTool.toolName) as AddLogPointTool | undefined;

    if (!tool) {
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

    const responsePromise = chatModel.sendRequest(
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
}
