import * as vscode from 'vscode';

export class AddLogPointTool implements vscode.LanguageModelTool<IAddLogPointToolParams> {
	public static toolName = 'logpoint_generator_add_logpoint';

	public get name() {
		return AddLogPointTool.toolName;
	}
	public get description() {
		return 'Adds a logpoint to the specified file at the given line and column number with the provided log message.';
	}

	constructor() { }

	async invoke(options: vscode.LanguageModelToolInvocationOptions<IAddLogPointToolParams>, token?: vscode.CancellationToken) {
		const { filePath, lineNumber, columnNumber, logMessage } = options.input;

		if (!filePath || !lineNumber || !logMessage) {
			throw new Error('filePath, lineNumber, and logMessage are required parameters.');
		}

		const position = new vscode.Position(lineNumber - 1, columnNumber ?? 0);
		const breakpoint = new vscode.SourceBreakpoint(
			new vscode.Location(vscode.Uri.file(filePath), new vscode.Range(position, position)),
			true, undefined, undefined, logMessage
		);
		vscode.debug.addBreakpoints([breakpoint]);

		const finalMessageString = `Added logpoint in ${filePath} at line ${lineNumber}, column ${columnNumber ?? 0}: ${logMessage}`;
		return new vscode.LanguageModelToolResult([
			new vscode.LanguageModelTextPart(finalMessageString)
		]);
	}

	prepareInvocation(options: vscode.LanguageModelToolInvocationPrepareOptions<IAddLogPointToolParams>, token: vscode.CancellationToken): vscode.ProviderResult<vscode.PreparedToolInvocation> {
		return undefined;
	}
}

export interface IAddLogPointToolParams {
	filePath: string;
	lineNumber: number;
	columnNumber: number;
	logMessage: string;
}