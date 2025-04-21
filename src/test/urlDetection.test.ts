import * as assert from 'assert';
import * as vscode from 'vscode';
import { URL_REGEX, isValidUrl, findUrls, getUrlAtPosition, getUrlsInSelection, isUrlInCodeBlock } from '../urlDetection';

suite('URL Detection Test Suite', () => {
  test('URL_REGEX should match valid URLs', () => {
    const validUrls = [
      'http://example.com',
      'https://example.com',
      'http://www.example.com',
      'https://example.com/path',
      'https://example.com/path?query=value',
      'https://example.com/path?query=value#fragment',
      'https://subdomain.example.com',
      'https://example.com/path/to/resource.html',
      'https://example.co.uk',
      'https://example.com:8080'
    ];

    for (const url of validUrls) {
      assert.strictEqual(url.match(URL_REGEX)?.[0], url, `URL_REGEX should match ${url}`);
    }
  });

  test('URL_REGEX should not match invalid URLs', () => {
    const invalidUrls = [
      'example.com', // Missing protocol
      'http:/example.com', // Missing slash
      'http//example.com', // Missing colon
      'http://', // Missing domain
      'http://localhost', // No TLD
      'ftp://example.com', // Unsupported protocol
      'http://example', // Missing TLD
      'text with http:// in it' // Incomplete URL
    ];

    for (const url of invalidUrls) {
      const match = url.match(URL_REGEX);
      if (match) {
        assert.notStrictEqual(match[0], url, `URL_REGEX should not fully match ${url}`);
      }
    }
  });

  test('isValidUrl should validate URLs correctly', () => {
    const validUrls = [
      'http://example.com',
      'https://example.com',
      'http://www.example.com',
      'https://example.com/path',
      'https://example.com/path?query=value',
      'https://example.com/path?query=value#fragment',
      'https://subdomain.example.com',
      'https://example.co.uk',
      'https://example.com:8080'
    ];

    const invalidUrls = [
      'not a url',
      'http://',
      'http://invalid', // No TLD
      'example.com', // Missing protocol
      'http//example.com', // Missing colon
      'ftp://example.com', // Unsupported protocol
      'http://localhost', // No TLD
      'http://example', // Missing TLD
      'http://example.', // Invalid TLD
      'text with http:// in it' // Incomplete URL
    ];

    for (const url of validUrls) {
      assert.strictEqual(isValidUrl(url), true, `${url} should be valid`);
    }

    for (const url of invalidUrls) {
      assert.strictEqual(isValidUrl(url), false, `${url} should be invalid`);
    }
  });

  test('findUrls should find all URLs in text', () => {
    const text = 'Visit http://example.com and https://another-example.com/path for more information.';
    const urls = findUrls(text);
    
    assert.strictEqual(urls.length, 2);
    assert.strictEqual(urls[0], 'http://example.com');
    assert.strictEqual(urls[1], 'https://another-example.com/path');
  });

  test('findUrls should return empty array for text without URLs', () => {
    const text = 'This text does not contain any URLs.';
    const urls = findUrls(text);
    
    assert.strictEqual(urls.length, 0);
  });

  // Mock tests for document-based functions
  // These would typically be integration tests with actual VS Code API
  
  test('getUrlAtPosition should detect URL at cursor position (mock)', () => {
    // This is a simplified mock test
    // In a real integration test, you would use actual VS Code document and position objects
    const mockDocument = {
      lineAt: (line: number) => ({
        text: 'Visit http://example.com for more information.'
      })
    } as unknown as vscode.TextDocument;
    
    const mockPosition = {
      line: 0,
      character: 10 // Position within the URL
    } as vscode.Position;
    
    const url = getUrlAtPosition(mockDocument, mockPosition);
    assert.strictEqual(url, 'http://example.com');
  });

  test('getUrlsInSelection should detect URLs in selection (mock)', () => {
    // This is a simplified mock test
    const mockDocument = {
      getText: () => 'Visit http://example.com and https://another-example.com for more information.'
    } as unknown as vscode.TextDocument;
    
    const mockSelection = {
      isEmpty: false
    } as unknown as vscode.Selection;
    
    const urls = getUrlsInSelection(mockDocument, mockSelection);
    assert.strictEqual(urls.length, 2);
    assert.strictEqual(urls[0], 'http://example.com');
    assert.strictEqual(urls[1], 'https://another-example.com');
  });

  test('isUrlInCodeBlock should detect URLs in code blocks (mock)', () => {
    // This is a simplified mock test
    const mockDocument = {
      lineAt: (line: number) => {
        if (line === 0) {
          return { text: '```' };
        } else if (line === 1) {
          return { text: 'http://example.com' };
        } else if (line === 2) {
          return { text: '```' };
        } else {
          throw new Error(`Line ${line} does not exist`);
        }
      }
    } as unknown as vscode.TextDocument;
    
    const mockPosition = {
      line: 1,
      character: 5
    } as vscode.Position;
    
    const inCodeBlock = isUrlInCodeBlock(mockDocument, mockPosition);
    assert.strictEqual(inCodeBlock, true, 'URL should be detected as being in a code block');
    
    // Test inline code block
    const mockDocumentInline = {
      lineAt: (line: number) => {
        return { text: 'This is `http://example.com` in inline code' };
      }
    } as unknown as vscode.TextDocument;
    
    const mockPositionInline = {
      line: 0,
      character: 15 // Position within the inline code
    } as vscode.Position;
    
    const inInlineCodeBlock = isUrlInCodeBlock(mockDocumentInline, mockPositionInline);
    assert.strictEqual(inInlineCodeBlock, true, 'URL should be detected as being in an inline code block');
  });
});
