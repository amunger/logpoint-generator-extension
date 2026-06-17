import { BasePromptElementProps, PromptElement, SystemMessage, UserMessage } from "@vscode/prompt-tsx";
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
        const languageId = doc?.languageId;

        const surroundingText = getSurroundingText(doc!, this.props.lineNumber - 1);

		return (
            <>
                <SystemMessage priority={200}>
                    You are an expert debugging assistant that writes logpoint messages for a developer.<br />
                    A logpoint is a non-breaking breakpoint that logs a message to the debug console when the line is reached.<br />
                    <br />
                    # Task<br />
                    Call the `logpoint_generator_add_logpoint` tool exactly once to add a logpoint. Do not reply with text instead of calling the tool.<br />
                    <br />
                    # Task focus<br />
                    Your primary goal is to expose the runtime values of the key variables relevant to this line, so the developer can see what the program is actually doing.<br />
                    Identify the variables, parameters, and expressions that most influence or are produced by this line, and surface their values in the message.<br />
                    <br />
                    # Logpoint message rules<br />
                    - Start the message with the formatted line number, e.g. `L45`.<br />
                    - Follow it with a single word or short phrase describing what the line does.<br />
                    - Expose the values of the key variables by wrapping expressions in curly braces, e.g. {'`{user.id}`'}. Anything inside braces is evaluated at runtime; text outside braces is printed literally.<br />
                    - Prefer including several relevant values (the inputs and, where already available, the outputs) over a single value, but only those that are genuinely meaningful for understanding this line.<br />
                    - Label each value so it is clear which variable it belongs to, e.g. {'`price={price}`'}.<br />
                    - Only reference variables or parameters that are already initialized and in scope at this line. Never reference a value that is assigned on this same line before it runs.<br />
                    - Keep the message on a single line and concise.<br />
                    <br />
                    # Example<br />
                    For a line `const total = price * quantity;` a good message is:<br />
                    `L45 calculate total price={'{price}'} qty={'{quantity}'}`<br />
                </SystemMessage>
                <UserMessage priority={100}>
                    Add a logpoint in {this.props.filepath} at line {this.props.lineNumber}.<br />
                    {languageId ? <>The language of the file is {languageId}.<br /></> : ''}
                    <br />
                    The code at line {this.props.lineNumber} is:<br />
                    ```<br />
                    {lineText}<br />
                    ```<br />
                    <UserMessage priority={50}>
                        <br />
                        For additional context, the surrounding file content is:<br />
                        ```<br />
                        {surroundingText}<br />
                        ```<br />
                    </UserMessage>
                </UserMessage>
            </>
        );
	}
}

function getSurroundingText(doc: TextDocument, lineNumber: number): string {
    const startLine = Math.max(0, lineNumber - 100);
    const endLine = Math.min(doc.lineCount - 1, lineNumber + 50);
    
    return doc.getText(new Range(startLine, 0, endLine, doc.lineAt(endLine).text.length));
}