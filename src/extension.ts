// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { findUrls, getUrlAtPosition, getUrlsInSelection, isUrlInCodeBlock, isValidUrl } from "./urlDetection";
import { fetchTitle, fetchTitles } from "./urlTitleFetcher";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "smart-markdown-link-url-title" is now active!');

  // Register command to detect URL at cursor position
  const detectUrlAtCursor = vscode.commands.registerCommand("smart-markdown-link-url-title.detectUrlAtCursor", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage("No active editor found");
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

          // Fetch the title of the URL
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Fetching title for ${url}`,
              cancellable: true,
            },
            async (progress, token) => {
              try {
                const result = await fetchTitle(url);
                if (result.title) {
                  vscode.window.showInformationMessage(`Title: ${result.title}`);
                } else {
                  vscode.window.showWarningMessage(`Could not fetch title: ${result.errorMessage}`);
                }
              } catch (error) {
                vscode.window.showErrorMessage(
                  `Error fetching title: ${error instanceof Error ? error.message : String(error)}`,
                );
              }
              return Promise.resolve();
            },
          );
        } else {
          vscode.window.showInformationMessage(`Malformed URL detected: ${url}`);
        }
      }
    } else {
      vscode.window.showInformationMessage("No URL detected at cursor position");
    }
  });

  // Register command to detect URLs in selection
  const detectUrlsInSelection = vscode.commands.registerCommand(
    "smart-markdown-link-url-title.detectUrlsInSelection",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("No active editor found");
        return;
      }

      const selection = editor.selection;
      if (selection.isEmpty) {
        vscode.window.showInformationMessage("No text selected");
        return;
      }

      // Get the selected text
      const selectedText = editor.document.getText(selection);

      // Find all URLs in the selected text
      const allUrls = findUrls(selectedText);

      // Filter valid URLs
      const validUrls = allUrls.filter((url) => isValidUrl(url));

      if (validUrls.length > 0) {
        vscode.window.showInformationMessage(`Valid URLs detected: ${validUrls.join(", ")}`);

        // Fetch titles for all valid URLs
        if (validUrls.length > 0) {
          vscode.window.withProgress(
            {
              location: vscode.ProgressLocation.Notification,
              title: `Fetching titles for ${validUrls.length} URLs`,
              cancellable: true,
            },
            async (progress, token) => {
              try {
                const results = await fetchTitles(validUrls);

                // Create a markdown report of the results
                const successfulResults = results.filter((r) => r.title);
                const failedResults = results.filter((r) => !r.title);

                if (successfulResults.length > 0) {
                  const message = successfulResults.map((r) => `${r.url}: ${r.title}`).join("\n");
                  vscode.window.showInformationMessage(`Fetched ${successfulResults.length} titles`);

                  // Show detailed results in an output channel
                  const outputChannel = vscode.window.createOutputChannel("URL Titles");
                  outputChannel.appendLine("# URL Titles");
                  outputChannel.appendLine("");
                  successfulResults.forEach((r) => {
                    outputChannel.appendLine(`* [${r.title}](${r.url})`);
                  });

                  if (failedResults.length > 0) {
                    outputChannel.appendLine("");
                    outputChannel.appendLine("# Failed URLs");
                    outputChannel.appendLine("");
                    failedResults.forEach((r) => {
                      outputChannel.appendLine(`* ${r.url} - ${r.errorMessage}`);
                    });
                  }

                  outputChannel.show();
                }

                if (failedResults.length > 0) {
                  vscode.window.showWarningMessage(`Failed to fetch ${failedResults.length} titles`);
                }
              } catch (error) {
                vscode.window.showErrorMessage(
                  `Error fetching titles: ${error instanceof Error ? error.message : String(error)}`,
                );
              }
              return Promise.resolve();
            },
          );
        }

        // If there are invalid URLs, show them as well
        const invalidUrls = allUrls.filter((url) => !isValidUrl(url));
        if (invalidUrls.length > 0) {
          vscode.window.showInformationMessage(`Malformed URLs detected: ${invalidUrls.join(", ")}`);
        }
      } else if (allUrls.length > 0) {
        vscode.window.showInformationMessage(`Only malformed URLs detected: ${allUrls.join(", ")}`);
      } else {
        vscode.window.showInformationMessage("No URLs detected in selection");
      }
    },
  );

  // Register command to fetch title for a specific URL
  const fetchTitleForUrl = vscode.commands.registerCommand(
    "smart-markdown-link-url-title.fetchTitleForUrl",
    async () => {
      const url = await vscode.window.showInputBox({
        prompt: "Enter URL to fetch title",
        placeHolder: "https://example.com",
        validateInput: (text) => {
          return isValidUrl(text) ? null : "Please enter a valid URL";
        },
      });

      if (!url) {
        return; // User cancelled
      }

      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Fetching title for ${url}`,
          cancellable: true,
        },
        async (progress, token) => {
          try {
            const result = await fetchTitle(url);
            if (result.title) {
              // Show the title
              vscode.window.showInformationMessage(`Title: ${result.title}`);

              // If there's an active editor, offer to insert the title as a markdown link
              const editor = vscode.window.activeTextEditor;
              if (editor) {
                const insertMarkdownLink = "Insert as Markdown Link";
                const userChoice = await vscode.window.showInformationMessage(
                  `Title: ${result.title}`,
                  insertMarkdownLink,
                );

                if (userChoice === insertMarkdownLink) {
                  const markdownLink = `[${result.title}](${url})`;
                  editor.edit((editBuilder) => {
                    editBuilder.insert(editor.selection.active, markdownLink);
                  });
                }
              }
            } else {
              vscode.window.showWarningMessage(`Could not fetch title: ${result.errorMessage}`);
            }
          } catch (error) {
            vscode.window.showErrorMessage(
              `Error fetching title: ${error instanceof Error ? error.message : String(error)}`,
            );
          }
          return Promise.resolve();
        },
      );
    },
  );

  // Register the original hello world command
  const helloWorld = vscode.commands.registerCommand("smart-markdown-link-url-title.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from smart-markdown-link-url-title!");
  });

  context.subscriptions.push(detectUrlAtCursor, detectUrlsInSelection, fetchTitleForUrl, helloWorld);
}

// This method is called when your extension is deactivated
export function deactivate() {}
