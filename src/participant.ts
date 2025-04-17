import * as vscode from 'vscode';

export function registerChatParticipant(context: vscode.ExtensionContext) {
    const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, chatContext: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {

        const fileRef = request.references[0].value as {uri: vscode.Uri; range: vscode.Range};
        const breakpoint = new vscode.SourceBreakpoint(
            new vscode.Location(fileRef.uri, fileRef.range),
            true, undefined, undefined, 'I am a log message'
        );
        vscode.debug.addBreakpoints([breakpoint]);

        stream.markdown('Logpoint added!');
    };

    const logPointsParticipant = vscode.chat.createChatParticipant('logpoint-generator', handler);
    logPointsParticipant.iconPath = new vscode.ThemeIcon('debug-breakpoint-log');
    context.subscriptions.push(logPointsParticipant);
}