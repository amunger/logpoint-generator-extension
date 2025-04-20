import * as vscode from 'vscode';

export class ModelSelector {

    constructor() {
    }

    public async getModel() {
        const models = await vscode.lm.selectChatModels();
        const configModelId = vscode.workspace.getConfiguration('logpoint-generator').get('modelId') as string;
        let model = models.find(m => m.id === configModelId);

        if (!model) {
            model = models[0];
            const selectedModel = await vscode.window.showQuickPick(
                models.map(m => ({ label: m.name, id: m.id })),
                { placeHolder: 'Select a model for logpoint generation' }
            );

            if (selectedModel) {
                await vscode.workspace.getConfiguration('logpoint-generator').update('modelId', selectedModel.id);
                model = models.find(m => m.id === selectedModel.id) || model;
            }
        }

        return model;
    }
}