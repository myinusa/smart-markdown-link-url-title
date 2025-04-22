# Smart Markdown Link URL Title

This VS Code extension provides functionality for detecting URLs in markdown documents and fetching their titles. It helps you identify URLs at the cursor position or within selected text, and can automatically fetch the title of web pages to create proper markdown links.

## Features

- Detect URLs at the cursor position
- Detect URLs in selected text
- Validate URLs for correctness
- Handle edge cases like URLs in code blocks
- Fetch titles from URLs automatically
- Create markdown links with the correct title
- Handle timeouts and errors gracefully

## Commands

This extension contributes the following commands:

- `Markdown: Detect URL at Cursor` - Detects and displays the URL at the current cursor position, and fetches its title
- `Markdown: Detect URLs in Selection` - Detects and displays all URLs in the current text selection, and fetches their titles
- `Markdown: Fetch Title for URL` - Prompts for a URL and fetches its title, with an option to insert it as a markdown link

## URL Detection and Title Fetching

### URL Detection

The extension uses a robust regex pattern to detect URLs in markdown documents:

```typescript
/https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)/g
```

This pattern matches:
- URLs with http or https protocols
- Optional www subdomain
- Domain names with at least one dot
- Optional paths, query parameters, and fragments

### Title Fetching

The extension fetches titles from URLs using the following process:

1. Fetch the HTML content from the URL with proper timeout handling
2. Parse the HTML to extract the title tag content
3. If no title tag is found, try to use the first h1 heading
4. Handle errors gracefully with informative messages

Example of a fetched title being inserted as a markdown link:

```markdown
[Example Domain](https://example.com)
```

## Edge Cases Handled

- URLs in code blocks (both fenced and inline)
- Malformed URLs
- URLs with special characters
- URLs with query parameters and fragments
- Timeouts for slow websites
- Network errors and failed requests
- HTML parsing errors

## Requirements

This extension requires an internet connection to fetch titles from URLs.

## Extension Settings

This extension does not contribute any settings yet.

## Known Issues

None at this time.

## Release Notes

### 0.0.1

Initial release with URL detection and title fetching functionality.

---

## Development

### Building the Extension

```bash
# Install dependencies
npm install

# Compile the extension
npm run compile

# Run tests
npm run test
```

**Enjoy!**
