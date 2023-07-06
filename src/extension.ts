import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const decoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'red',
		color:'#fff'
    });

	const i18nCallDecoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'lightgreen'
    });

    let highlightedRanges: vscode.Range[] = [];

    function highlightChineseCharacters(editor: vscode.TextEditor) {
        const document = editor.document;
        const text = document.getText();
        const regex = /\/\/.*|\/\*[\s\S]*?\*\/|('[\u4e00-\u9fa5]+(?:[\u4e00-\u9fa5，。；：！？【】（）“”‘’0-9$`]+)*[\u4e00-\u9fa5]*')|([\u4e00-\u9fa5]+(?:[\u4e00-\u9fa5，。；：！？【】（）“”‘’0-9$`]+)*[\u4e00-\u9fa5]*)/g;
        const matches: vscode.Range[] = [];

        let match;
        while ((match = regex.exec(text))) {
            const isComment = match[0].startsWith('//') || match[0].startsWith('/*');
            if (!isComment && match[1]) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[1].length);
                const range = new vscode.Range(startPos, endPos);
                matches.push(range);
            }
            if (!isComment && match[2]) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[2].length);
                const range = new vscode.Range(startPos, endPos);
                matches.push(range);
            }
        }

        editor.setDecorations(decoration, matches);
        highlightedRanges = matches;
    }

	function highlightI18nCalls(editor: vscode.TextEditor) {
        const document = editor.document;
        const text = document.getText();
        const regex =/t\((['"`])(.*?[^\\])\1\s*(,\s*\{[^}]+\})?\)/g;
        const matches: vscode.Range[] = [];

        let match;
        while ((match = regex.exec(text))) {
            const isComment = match[0].startsWith('//') || match[0].startsWith('/*');
            if (!isComment && match[1]) {
                const startPos = document.positionAt(match.index);
                const endPos = document.positionAt(match.index + match[1].length);
                const range = new vscode.Range(startPos, endPos);
                matches.push(range);
            }
        }

        editor.setDecorations(i18nCallDecoration, matches);
    }

    const replaceCommand = vscode.commands.registerCommand('extension.replaceChinese', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const replaceText = 't';

            editor.edit(editBuilder => {
                highlightedRanges.forEach(range => {
                    const text = document.getText(range);
                    editBuilder.replace(range, `${replaceText}('${text}')`);
                });
            });

			editor.setDecorations(decoration, []);
            highlightI18nCalls(editor);
        }
    });

    const replaceButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    replaceButton.text = "$(code) Replace Chinese";
    replaceButton.command = "extension.replaceChinese";
    replaceButton.show();

    context.subscriptions.push(replaceCommand, replaceButton);

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            highlightChineseCharacters(editor);
            highlightI18nCalls(editor);
        }
    });
}

export function deactivate() {}
