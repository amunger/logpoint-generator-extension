import { BasePromptElementProps, PromptElement, UserMessage } from "@vscode/prompt-tsx";
import { Range, TextDocument, workspace } from "vscode";

export interface LogPointProps extends BasePromptElementProps {
	filepath: string;
    lineNumber: number;
}

export class LogPointPrompt extends PromptElement<LogPointProps, void> {
    render() {
        const doc = workspace.textDocuments.find(doc => doc.uri.toString() === this.props.filepath);
        const line = doc?.lineAt(this.props.lineNumber - 1);
        const lineText = line ? line.text : '';
        const language = <>{doc?.languageId ? `The language of the file is ${doc.languageId}.` : ''}<br /></>;
        const variableDescription = '"variableName: {variableValue}"';
    
        const surroundingText = getSurroundingText(doc!, this.props.lineNumber - 1);

		return (
            <UserMessage>
                - Use the logpoint_generator_add_logpoint tool to generate a useful logpoint in {this.props.filepath} at line {this.props.lineNumber}.<br />
                - The log point should be added to the file at the specified line number. <br />
                - The logpoint message should be a string that is useful for debugging. <br />
                - The logpoint message should start with a formatted line number (e.g. L45) and describe the line shortly in plain english. <br />
                - Include parameters or variables used on the line as long as they have already been initialized. <br />
                - Variables should be added like so: {variableDescription}". <br />
                - {language}
                - The code at the line is: <br />
                ``` <br />
                {lineText} <br />
                ``` <br />         
                <UserMessage priority={100}> 
                    <br />
                    - The file content around that line is: <br />
                    ``` <br />
                    {surroundingText} <br />
                    ``` <br />
                </UserMessage>
            </UserMessage>
        );
	}
}

function getSurroundingText(doc: TextDocument, lineNumber: number): string {
    const startLine = Math.max(0, lineNumber - 100);
    const endLine = Math.min(doc.lineCount - 1, lineNumber + 50);
    
    return doc.getText(new Range(startLine, 0, endLine, doc.lineAt(endLine).text.length));
}