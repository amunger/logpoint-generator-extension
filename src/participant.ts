import * as vscode from 'vscode';
import { generateLogPoint } from './logPointGenerator';
import { ModelSelector } from './modelSelector';

export function registerChatParticipant(context: vscode.ExtensionContext) {

    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
        const fileRef = request.references[0].value as { uri: vscode.Uri; range: vscode.Range };
        await generateLogPoint(fileRef.uri.toString(), fileRef.range.start.line + 1, request.model);
        stream.markdown('Logpoint added!');
    };

    const logPointsParticipant = vscode.chat.createChatParticipant('logpoint-generator', handler);
    logPointsParticipant.iconPath = new vscode.ThemeIcon('debug-breakpoint-log');
    context.subscriptions.push(logPointsParticipant);
}