'use strict';

import * as vscode from 'vscode';
import * as format from './format';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('extension.sqlStyler', function () {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			// Get the word within the selection
			const word = document.getText(selection);
			// const reversed = word.split('').reverse().join('');
			const formatted = format.format(word);
			editor.edit(editBuilder => {
				// editBuilder.replace(selection, reversed);
				editBuilder.replace(selection, formatted);
			});
		}
	});

	context.subscriptions.push(disposable);
}
