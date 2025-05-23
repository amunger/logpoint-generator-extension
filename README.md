# logpoint-generator README

Quickly create logpoints with meaningful messages to help troubleshoot your code running in the debugger.

## Features

### Generate Logpoints

The `Generate Logpoint` command can be used from the gutter context menu or calling the command directly while focused in the editor, and a logpoint should be added on that line with a relevant message.

<img src=https://raw.githubusercontent.com/amunger/logpoint-generator-extension/main/assets/generateLogPoint.gif>

#### Chat/Agent tool

The `logpoint_generator_add_logpoint` is registered to be used by chat participants that use tools or the copilot agent to be able to add log points through chat interactions.

## Extension Settings

- `logpoint-generator.modelId` - Set the model to use for logpoint message generation.

## Requirements

### Chat Language Model Available

This extension will send requests to a chat model provided by other extensions, such as Copilot.

## Release Notes

### 1.0.1

- Update readme

### 1.0.0

- Updated Readme.
- New Configuration to select model used in generating message.

### 0.0.1

Initial release with Generate Logpoint command and chat tool.

---

**Enjoy!**
