import * as vscode from 'vscode';
import { registerChatParticipant } from './participant';
import { registerCommands } from './commands';
import { AddLogPointTool } from './addLogpointTool';

export function activate(context: vscode.ExtensionContext) {
	registerCommands(context);
	vscode.lm.registerTool(AddLogPointTool.toolName, new AddLogPointTool());

	//registerChatParticipant(context); not currently working, but still useful to see the prompt in the debug log.
}

export function deactivate() { }
