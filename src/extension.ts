// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { findUrls, getUrlAtPosition, getUrlsInSelection, isUrlInCodeBlock, isValidUrl } from './urlDetection';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension "smart-markdown-link-url-title" is now active!');

	// Register command to detect URL at cursor position
	const detectUrlAtCursor = vscode.commands.registerCommand('smart-markdown-link-url-title.detectUrlAtCursor', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found');
			return;
		}

		const position = editor.selection.active;
		const url = getUrlAtPosition(editor.document, position);
		
		if (url) {
			// Check if the URL is in a code block
			if (isUrlInCodeBlock(editor.document, position)) {
				vscode.window.showInformationMessage(`URL in code block: ${url}`);
			} else {
				// Validate the URL
				if (isValidUrl(url)) {
					vscode.window.showInformationMessage(`URL detected: ${url}`);
				} else {
					vscode.window.showInformationMessage(`Malformed URL detected: ${url}`);
				}
			}
		} else {
			vscode.window.showInformationMessage('No URL detected at cursor position');
		}
	});

	// Register command to detect URLs in selection
	const detectUrlsInSelection = vscode.commands.registerCommand('smart-markdown-link-url-title.detectUrlsInSelection', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found');
			return;
		}

		const selection = editor.selection;
		if (selection.isEmpty) {
			vscode.window.showInformationMessage('No text selected');
			return;
		}

		// Get the selected text
		const selectedText = editor.document.getText(selection);
		
		// Find all URLs in the selected text
		const allUrls = findUrls(selectedText);
		
		// Filter valid URLs
		const validUrls = allUrls.filter(url => isValidUrl(url));
		
		if (validUrls.length > 0) {
			vscode.window.showInformationMessage(`Valid URLs detected: ${validUrls.join(', ')}`);
			
			// If there are invalid URLs, show them as well
			const invalidUrls = allUrls.filter(url => !isValidUrl(url));
			if (invalidUrls.length > 0) {
				vscode.window.showInformationMessage(`Malformed URLs detected: ${invalidUrls.join(', ')}`);
			}
		} else if (allUrls.length > 0) {
			vscode.window.showInformationMessage(`Only malformed URLs detected: ${allUrls.join(', ')}`);
		} else {
			vscode.window.showInformationMessage('No URLs detected in selection');
		}
	});

	// Register the original hello world command
	const helloWorld = vscode.commands.registerCommand('smart-markdown-link-url-title.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from smart-markdown-link-url-title!');
	});

	context.subscriptions.push(detectUrlAtCursor, detectUrlsInSelection, helloWorld);
}

// This method is called when your extension is deactivated
export function deactivate() {}
