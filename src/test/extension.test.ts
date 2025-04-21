import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as urlDetection from '../urlDetection';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('URL detection module should be loaded', () => {
		assert.notStrictEqual(urlDetection, undefined);
		assert.notStrictEqual(urlDetection.URL_REGEX, undefined);
		assert.notStrictEqual(urlDetection.isValidUrl, undefined);
		assert.notStrictEqual(urlDetection.findUrls, undefined);
		assert.notStrictEqual(urlDetection.getUrlAtPosition, undefined);
		assert.notStrictEqual(urlDetection.getUrlsInSelection, undefined);
		assert.notStrictEqual(urlDetection.isUrlInCodeBlock, undefined);
	});

	test('URL_REGEX should match valid URLs', () => {
		const testUrl = 'https://example.com';
		const match = testUrl.match(urlDetection.URL_REGEX);
		assert.notStrictEqual(match, null);
		assert.strictEqual(match?.[0], testUrl);
	});
});
